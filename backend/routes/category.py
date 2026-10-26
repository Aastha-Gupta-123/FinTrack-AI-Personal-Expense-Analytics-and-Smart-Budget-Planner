from flask import Blueprint
from controllers.category_controller import CategoryController

bp = Blueprint('category', __name__, url_prefix='/api/categories')

bp.add_url_rule('',    view_func=CategoryController.list_categories,  methods=['GET'])
bp.add_url_rule('',    view_func=CategoryController.create_category,  methods=['POST'])
bp.add_url_rule('/<int:category_id>', view_func=CategoryController.delete_category, methods=['DELETE'])
