from django.urls import path

from .views import rawi, gui2r_retrieval

urlpatterns = [
    path('', rawi, name='rawi'),
    path('gui2r/v1/retrieval', gui2r_retrieval, name='gui2r_retrieval'),
]