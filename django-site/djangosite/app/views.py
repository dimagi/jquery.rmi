from django.http import HttpResponse
from django.shortcuts import render
from django.views.generic import TemplateView
from djangular.views.mixins import JSONResponseMixin, allow_remote_invocation


def test(request):
    return HttpResponse("it works.");


def json(request, arg=None):
    if arg is None:
        arg = '{"foo": 1}'
    return HttpResponse(arg, content_type="application/json");


class RmiView(JSONResponseMixin, TemplateView):
    template_name = 'tests.html'

    @allow_remote_invocation
    def process_data(self, in_data):
        out_data = {
            'input': in_data,
            'foo': 'bar',
            'success': True,
        }
        return out_data
