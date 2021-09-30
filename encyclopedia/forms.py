from django import forms


class NewEntryForms(forms.Form):
    entry_name = forms.CharField()
    entry_markdown = forms.CharField(widget=forms.Textarea())
