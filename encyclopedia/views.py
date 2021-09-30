import random

from django.contrib import messages
from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect


from . import util
from . import forms
import markdown2


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })


def entry(request, entry_title):
    """Verify entry name exists, and if does render page, if not render error"""
    entry_title = util.check_entry_exists(entry_title)
    if not entry_title:
        messages.error(request, "Invalid Entry Name")
        return render(request, "encyclopedia/error_page.html")
    else:
        entry_markdown = util.get_entry(entry_title)
    return render(request, "encyclopedia/entry.html", {
        "entry_name": entry_title,
        "entry_markdown": markdown2.markdown(entry_markdown),
    })


def search(request):
    """Get search query"""
    search_query = request.GET.get('q')

    partial_matches = []
    for page in util.list_entries():
        if search_query.lower() == page.lower():
            return HttpResponseRedirect(page)
        elif search_query.lower() in page.lower():
            partial_matches.append(page)
    return render(request, "encyclopedia/search.html", {
        "search_name": search_query,
        "partial_matches": partial_matches,
    })


def new_page(request):
    if request.method == "POST":
        form = forms.NewEntryForms(request.POST)
        if form.is_valid():
            entry_name = form.cleaned_data['entry_name']
            entry_markdown = form.cleaned_data['entry_markdown']
            if entry_name in util.list_entries():
                messages.error(request, "Entry name already exists")
                return render(request, "encyclopedia/error_page.html")
            else:
                util.save_entry(entry_name, entry_markdown)
                return redirect('entry', entry_title=entry_name)

    return render(request, "encyclopedia/new_page.html", {
        "form": forms.NewEntryForms(),
    })


def edit_page(request):
    if request.method == "POST":
        form = forms.NewEntryForms(request.POST)

        if form.is_valid():
            entry_name = form.cleaned_data["entry_name"]
            entry_markdown = form.cleaned_data["entry_markdown"]
            util.save_entry(entry_name, entry_markdown)
            return HttpResponseRedirect(entry_name)
        else:
            entry_name = form.cleaned_data["entry_name"]
            entry_markdown = util.get_entry(entry_name)
            return render(request, "encyclopedia/edit_page.html", {
                "entry_name": entry_name,
                "entry_markdown": entry_markdown,
            })


def error_page(request):
    return render(request, "encyclopedia/error_page.html", {
        "title": "Error Page",
    })


def random_page(request):
    chosen_page = random.choice(util.list_entries())
    return redirect('entry', entry_title=chosen_page)

