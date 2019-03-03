from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from flaskr.auth import login_required
from flaskr.db import get_db

import os
MAP_KEY = os.getenv("MAP_KEY")
FB_KEY = os.getenv("FB_KEY")

bp = Blueprint('maps', __name__)

@bp.route('/')
@login_required
def index():
    return render_template('maps/show.html', key=MAP_KEY, FB_KEY=FB_KEY)