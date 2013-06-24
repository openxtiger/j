YUI.add('api-list', function (Y) {

    var Lang = Y.Lang,
        YArray = Y.Array,

        APIList = Y.namespace('APIList'),

        classesNode = Y.one('#api-classes'),
        inputNode = Y.one('#api-filter'),
        modulesNode = Y.one('#api-modules'),
        tabviewNode = Y.one('#api-tabview'),


        tabs = APIList.tabs = {},

        filter = APIList.filter = new Y.APIFilter({
            inputNode: inputNode,
            maxResults: 1000,

            on: {
                results: onFilterResults
            }
        }),

        LIST_ITEM_TEMPLATE =
            '<li class="api-list-item {typeSingular}">' +
                '<a href="{rootPath}{typePlural}/{name}.html">{displayName}</a>' +
                '</li>';

    filter.setAttrs({
        minQueryLength: 0,
        queryType: 'classes'
    });

// -- Private Functions --------------------------------------------------------
    function getFilterResultNode() {
        return filter.get('queryType') === 'classes' ? classesNode : modulesNode;
    }

// -- Event Handlers -----------------------------------------------------------
    function onFilterResults(e) {
        var frag = Y.one(Y.config.doc.createDocumentFragment()),
            resultNode = getFilterResultNode(),
            typePlural = filter.get('queryType'),
            typeSingular = typePlural === 'classes' ? 'class' : 'module';
        if (e.results.length) {
            YArray.each(e.results, function (result) {

                frag.append(Lang.sub(LIST_ITEM_TEMPLATE, {
                    rootPath: APIList.rootPath,
                    displayName: filter.getDisplayName(result.highlighted),
                    name: result.text,
                    typePlural: typePlural,
                    typeSingular: typeSingular
                }));
            });
        } else {
            frag.append(
                '<li class="message">' +
                    'No ' + typePlural + ' found.' +
                    '</li>'
            );
        }

        resultNode.empty(true);
        resultNode.append(frag);

        focusManager.refresh();
    }

    function onSearchClear(e) {
    }


}, '3.4.0', {requires: [
    'api-filter', 'api-search', 'event-key', 'node-focusmanager', 'tabview'
]});
