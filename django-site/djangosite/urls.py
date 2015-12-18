from django.conf.urls import patterns, include, url

import djangosite.app.views


urlpatterns = patterns('',
    url(r'^$', djangosite.app.views.RmiView.as_view(), name='rmiview'),
    url(r'^json/$', djangosite.app.views.json, name='json'),
    url(r'^test/$', djangosite.app.views.test, name='test'),
)
