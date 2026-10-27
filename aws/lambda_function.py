"""
SmartAttend AI - AWS Lambda Python 3.11 Backend Handler
Integrates DynamoDB, API Gateway, and Google Gemini API
"""

import json
import os
import time
import math
import boto3
from botocore.exceptions import ClientError
import urllib.request
import urllib.error

# Environment Variables injected by AWS SAM / CloudFormation
STAGE = os.environ.get('STAGE', 'prod')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
USERS_TABLE = os.environ.get('USERS_TABLE', f'smartattend_users_{STAGE}')
ATTENDANCE_TABLE = os.environ.get('ATTENDANCE_TABLE', f'smartattend_records_{STAGE}')
SESSIONS_TABLE = os.environ.get('SESSIONS_TABLE', f'smartattend_sessions_{STAGE}')
AUDIT_TABLE = os.environ.get('AUDIT_TABLE', f'smartattend_audit_logs_{STAGE}')

# Boto3 DynamoDB Client
dynamodb = boto3.resource('dynamodb')

def response(status_code: int, body: dict):
    """Standard HTTP JSON Response with CORS headers"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
        },
        'body': json.dumps(body)
    }

def calculate_classes_needed(attended: int, held: int, target_pct: float = 75.0) -> int:
    """Deterministic formula: n = max(0, ceil((T * H - A) / (1 - T)))"""
    if held <= 0 or target_pct >= 100:
        return 0
    current_pct = (attended / held) * 100
    if current_pct >= target_pct:
        return 0
    T = target_pct / 100.0
    numerator = T * held - attended
    denominator = 1.0 - T
    ratio = round((numerator / denominator) * 1e8) / 1e8
    return max(0, math.ceil(ratio))

def lambda_handler(event, context):
    """AWS Lambda Entry Point"""
    path = event.get('rawPath') or event.get('path', '')
    http_method = event.get('requestContext', {}).get('http', {}).get('method') or event.get('httpMethod', '')

    # Preflight CORS
    if http_method == 'OPTIONS':
        return response(200, {'status': 'ok'})

    try:
        # Route: GET /api/health
        if path == '/api/health' and http_method == 'GET':
            return response(200, {
                'status': 'healthy',
                'service': 'SmartAttend AI AWS Lambda (Python 3.11)',
                'environment': STAGE,
                'region': os.environ.get('AWS_REGION', 'us-east-1'),
                'geminiConfigured': bool(GEMINI_API_KEY)
            })

        # Route: POST /api/sessions/generate-qr
        elif path == '/api/sessions/generate-qr' and http_method == 'POST':
            body = json.loads(event.get('body', '{}'))
            session_id = body.get('sessionId')
            if not session_id:
                return response(400, {'error': 'sessionId is required'})

            now = int(time.time() * 1000)
            ttl_ms = 20 * 1000  # 20 seconds
            token = f"SMARTATTEND:{session_id}:{now}:{os.urandom(4).hex()}"

            return response(200, {
                'sessionId': session_id,
                'token': token,
                'expiresAt': now + ttl_ms,
                'ttlSeconds': 20
            })

        # Route: POST /api/sessions/validate-qr
        elif path == '/api/sessions/validate-qr' and http_method == 'POST':
            body = json.loads(event.get('body', '{}'))
            token = body.get('token', '')
            student_id = body.get('studentId')
            student_name = body.get('studentName', 'Student')
            roll_number = body.get('rollNumber', '')

            if not token or not student_id:
                return response(400, {'success': False, 'error': 'token and studentId required'})

            parts = token.split(':')
            if len(parts) < 4 or parts[0] != 'SMARTATTEND':
                return response(400, {'success': False, 'error': 'Invalid QR token format'})

            session_id = parts[1]
            token_time = int(parts[2])
            current_time = int(time.time() * 1000)

            # Check 20s TTL
            if current_time - token_time > 20000:
                return response(410, {'success': False, 'error': 'QR Code expired! Please scan the newly refreshed QR.'})

            # Conditional Put to DynamoDB preventing duplicate submission
            table = dynamodb.Table(ATTENDANCE_TABLE)
            try:
                table.put_item(
                    Item={
                        'sessionId': session_id,
                        'studentId': student_id,
                        'studentName': student_name,
                        'rollNumber': roll_number,
                        'attendanceStatus': 'present',
                        'markedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                        'markedBy': 'student_qr'
                    },
                    ConditionExpression='attribute_not_exists(sessionId) AND attribute_not_exists(studentId)'
                )
            except ClientError as e:
                if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                    return response(200, {
                        'success': True,
                        'message': 'Attendance already recorded for this session.'
                    })
                raise

            return response(200, {
                'success': True,
                'sessionId': session_id,
                'studentId': student_id,
                'message': 'Attendance verified and recorded in Amazon DynamoDB.'
            })

        # Route: POST /api/ai/assistant
        elif path == '/api/ai/assistant' and http_method == 'POST':
            body = json.loads(event.get('body', '{}'))
            query = body.get('query', '')
            user = body.get('user', {})
            context_data = body.get('contextData', {})

            if not GEMINI_API_KEY:
                # Deterministic fallback if API key is not yet configured
                stats = context_data.get('studentStats', [])
                low = [s for s in stats if s.get('percentage', 100) < 75]
                answer = f"Your overall attendance is {context_data.get('overallPercentage', 78.5)}%.\n"
                if low:
                    answer += f"Attention required in {len(low)} course(s):\n"
                    for s in low:
                        needed = calculate_classes_needed(s.get('attended', 0), s.get('held', 0), 75.0)
                        answer += f"• {s.get('subjectCode')}: {s.get('percentage')}% (Must attend next {needed} consecutive classes)\n"
                return response(200, {'answer': answer, 'source': 'deterministic-fallback'})

            # Query Google Gemini 3.8 Flash API
            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={GEMINI_API_KEY}"
            prompt = f"""
System: You are the official SmartAttend AI Assistant for St. Jude Institute of Technology & Engineering.
Strictly ground answers in this authoritative DynamoDB context:
{json.dumps(context_data)}

User Inquiry: {query}
Answer concisely, authoritatively, and empathetically:
"""
            req_data = json.dumps({'contents': [{'parts': [{'text': prompt}]}]}).encode('utf-8')
            req = urllib.request.Request(gemini_url, data=req_data, headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req) as resp:
                res_json = json.loads(resp.read().decode('utf-8'))
                text = res_json['candidates'][0]['content']['parts'][0]['text']
                return response(200, {'answer': text, 'source': 'gemini-3.8-flash'})

        return response(404, {'error': f'Route not found: {http_method} {path}'})

    except Exception as e:
        return response(500, {'error': str(e)})
