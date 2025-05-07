from flask import Blueprint, request, jsonify, current_app
from app.models.user import User
from app.extensions import db
import jwt
from datetime import datetime, timedelta
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'message': 'Token is missing!'}), 401
        
        # Handle both "Bearer token" and direct token formats
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        else:
            token = auth_header
        
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                raise Exception('User not found')
        except Exception as e:
            return jsonify({'message': f'Token is invalid! {str(e)}'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'message': 'Token is missing!'}), 401
        
        # Handle both "Bearer token" and direct token formats
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        else:
            token = auth_header
        
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                raise Exception('User not found')
            
            # Check if user is admin
            if current_user.role != 'admin':
                return jsonify({'message': 'Admin privileges required!'}), 403
                
        except Exception as e:
            return jsonify({'message': f'Token is invalid! {str(e)}'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists!'}), 409
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists!'}), 409
        
    user = User(
        username=data['username'],
        email=data['email'],
        role=data.get('role', 'staff')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully!'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid credentials!'}), 401
    
    # Check if the requested role matches the user's role
    requested_role = data.get('role', 'staff')
    if requested_role != user.role:
        return jsonify({'message': f'Access denied. You don\'t have {requested_role} privileges.'}), 403
        
    # Update last login time
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    token = jwt.encode({
        'user_id': user.id,
        'role': user.role,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, current_app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'last_login': user.last_login.isoformat() if user.last_login else None
        }
    }), 200

@auth_bp.route('/status', methods=['GET'])
@token_required
def get_status(current_user):
    return jsonify({
        'user': {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'role': current_user.role,
            'last_login': current_user.last_login.isoformat() if current_user.last_login else None
        },
        'is_authenticated': True,
        'permissions': get_permissions_for_role(current_user.role)
    }), 200

def get_permissions_for_role(role):
    permissions = {
        'admin': [
            'view_dashboard',
            'view_inventory',
            'add_product',
            'edit_product',
            'delete_product',
            'restock_product',
            'view_calculator',
            'view_trends',
            'export_data'
        ],
        'staff': [
            'view_dashboard',
            'view_inventory',
            'view_trends'
        ]
    }
    
    return permissions.get(role, [])