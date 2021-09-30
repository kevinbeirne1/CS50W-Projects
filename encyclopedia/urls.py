from django.urls import path, re_path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("random/", views.random_page, name="random_page"),
    path("new_page", views.new_page, name="new_page"),
    path("edit_page", views.edit_page, name="edit_page"),
    path("error", views.error_page, name="error_page"),
    path("index.php", views.search, name="search"),
    # re_path(r'^(?P<entry_title>.*$)', views.entry, name="entry"),
    # path("search/", views.search, name="search"),
    # re_path(r'^.*$', views.search, name="search"),
    path("<str:entry_title>", views.entry, name="entry"),
]
