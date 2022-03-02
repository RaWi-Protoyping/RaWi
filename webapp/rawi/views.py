from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse
from gui2r.retrieval.configuration.conf import Configuration
from gui2r.retrieval.retriever import Retriever
from gui2r.preprocessing.extraction import Extractor
import os

max_results_shown = 100
abs_path = os.path.dirname(__file__) + '/../gui2rapp/staticfiles/resources/'
vis_segments = [Extractor.DATA_ACTIVITY_NAME, Extractor.DATA_TEXT_VISIBLE, Extractor.DATA_RES_IDS_VISIBLE, Extractor.DATA_ICON_IDS]
vis_conf_full_new_filter = Configuration(path_guis=abs_path + 'combined/',
                                         path_dsls=abs_path + 'combined/',
                                         path_semantic=abs_path + 'semantic_annotations/',
                                         path_preproc_text=abs_path + 'preproc_text/',
                                         path_app_details=abs_path + 'app_details.csv',
                                         path_ui_details=abs_path + 'ui_details.csv',
                                         path_models=abs_path + 'models/new/',
                                         dir_name_prefix='new',
                                         filter_guis=True,
                                         text_segments_used=vis_segments)

# Initialize the retriever
retriever = Retriever(vis_conf_full_new_filter)

@csrf_exempt
def gui2r_retrieval(request):
    if request.method == 'POST':
        jsonData = json.loads(request.body)
        query = jsonData['query']
        method = jsonData['method']
        qe_method = jsonData['qe_method'] if jsonData['qe_method'] else None
        max_results = jsonData['max_results']
        documents = retriever.rank(query=query, method=method, qe_method=qe_method, max_results=max_results)
        results = [{"rank": ranked_doc.rank, "index": ranked_doc.document.index, "score": ranked_doc.conf} for ranked_doc in documents]
        f_response = {"results": results}
        return JsonResponse( f_response, safe=False)


def rawi(request):
    return render(request, 'index.html')