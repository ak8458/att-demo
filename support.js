;(function ($, window, document, undefined) {
    var topicData, 
        topicArray,
        contentData,
        breadCrumbArr = [],
        solutionsArray = [],
        config = {
            topicsURL   : 'https://services.att.com/kmservices/v2/tagsets/topic/topic_globalmarketing?app-id=gmarket',
            solutionsUrl: 'https://services.att.com/kmservices/v2/search?content-type=content_busfaq,content_weblink&description=y&tags=',
            topicInfoUrl: 'https://services.att.com/kmservices/v2/search?content-type=content_topicinfo&description=y&tags=',
            contentUrl  : 'https://services.att.com/kmservices/v2/contents/'
        },

    getTopics = function () {
        var childrenObj = [],
            parentObj = [];
        $.ajax({
            url: config.topicsURL,
            type: 'GET',
            dataType: 'json',
            async: false,
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
        }).done(function (data) {
            parentObj = data.resultBody.children[1].children;
        });
        return parentObj;
    },
    
    display = function () {
        var url = window.location.href,
            idx = url.lastIndexOf('#'),
            topicId = idx > -1 ? url.substr(idx + 1) : 'topic_attbusinesscenter0',
            contId = getContentId(url),
            section = getSectionUrl(url),
            contentCheck;

        if (hasSubtopics(topicId)) {
            displaySubtopics(topicId);
        } else {
            if (section == 'content') {
                contentObj = displayContent(contId, topicId);
                contentCheck = true;
            } else {
                displaySolutions(topicId);
            }
        }

        createBreadCrumbArr(topicId);

        var menuList = $('<ul class="nav"/>').appendTo('.support-nav');

        if (!contentCheck) $('.support-head').text("Support Center");
        $.each(topicArray, function (i, v) {
            var cont = 'topic';
            var con = '"' + cont + '"';
            var vid = '"' + v.systemCode + '"';
            var vidclass = '"' + v.systemCode + ' topics_main"';
            var vname = '"' + v.displayTagName + '"';
            var mainNavUrl = window.location.pathname + '?' + cont + '#' + v.systemCode;
            var li = $('<li/>')
                .append($('<a class=' + vidclass + ' data-vid=' + vid + ' data-con=' + con + ' data-vname=' + vname + ' href="' + mainNavUrl + '" />')
                .text(v.displayTagName))
                .appendTo(menuList);

            if (v.hasOwnProperty("children")) {
                li.append($("<ul id='"+v.systemCode+"' class='sub-nav2'/>"));
                $(".sub-nav2").hide();
                $.each(topicArray[i].children, function (i2, v2) {
                    var cont2 = "subtopic";
                    var con2 = '"' + cont2 + '"';
                    var v2id = '"' + v2.systemCode + '"';
                    var v2idClass = '"' + v2.systemCode + ' topics_subnav"';
                    var v2name = '"' + v2.displayTagName + '"';
                    var subNavUrl = window.location.pathname + '?' + cont2 + '#' + v2.systemCode;                                        
                    $('#'+v.systemCode)
                        .append($("<li/>")
                        .append($('<a class=' + v2idClass + ' data-vid=' + v2id + ' data-con=' + con2 + ' data-vname=' + v2name + ' data-parent=' + vname + 'href="' + subNavUrl + '" />')
                        .text(v2.displayTagName)));
                });
            } else {}
        });
        $('.' + topicId).addClass('active');
        $.each(breadCrumbArr, function (i, v) {
            var systemCode = "'"+v.systemCode+"'",
            displayTagName = "'"+v.displayTagName+"'",
            parentTagName = "'"+v.parentTagName+"'",
            liTagLen =  $("#breadcrumb-component ul li").length,
            liTag = '<li itemprop="itemListElement" itemscope="" itemtype="https://schema.org/ListItem" class="breadcrumb path">' + 
                                '<meta itemprop="position" content="3">' + 
                                '<a href="/support.html" class="att-track" data-slot="Breadcrumb Bar" data-content="Breadcrumb" data-name="Breadcrumb - AT&amp;T Support for Business Customers " itemprop="item">' + 
                                '<span itemprop="name">' + 
                                'AT&T Business support' + ' </span></a>' + 
                                '<span class="glyphicon glyphicon-menu-right"></span>' + 
                            '</li>',
            topic = "'topic'";
            subtopic = "'subtopic'";
            if (typeof contentCheck !== 'undefined' && contentCheck) {
            } else if (i == 0) {
                //$('.breadcrumbs ul').append('<li itemprop="itemListElement" itemscope="" itemtype="http://schema.org/ListItem"><a itemprop="item" data-vid=' + systemCode + ' data-con=' + topic + ' data-vname=' + displayTagName + ' href="javascript:void(0);" class="bread-topic"><span itemprop="name">'+v.displayTagName+'</span></a><span><img src="/content/images/carat-forward-right.png" alt="" width="4" height="8"></span></li>');
                // $(".current-page").html("<span itemprop='name'>"+v.displayTagName+"</span>");
                $(".current-page").html("<span itemprop='name'>AT&T Business support</span>");
            } else if(i != 0) {
                //$('.breadcrumbs ul').append('<li itemprop="itemListElement" itemscope="" itemtype="http://schema.org/ListItem"><a itemprop="item" data-vid=' + systemCode + ' data-con=' + subtopic + ' data-vname=' + displayTagName + ' data-parent=' + parentTagName + ' href="javascript:void(0);" class="bread-sub-topic"><span itemprop="name">'+v.displayTagName+'</span></a><span><img src="/content/images/carat-forward-right.png" alt="" width="4" height="8"></span></li>');
                // $(".current-page").html("<span itemprop='name'>"+v.displayTagName+"</span>");
                $(".current-page").html("<span itemprop='name'>AT&T Business support</span>");
            }
            //if (liTagLen == 3) $(liTag).insertBefore($(".current-page"));
            //if (contentCheck) $(".current-page").html("<span itemprop='name'>" + $('.support-head').text() + "</span>");
        });
        if (typeof contentCheck !== 'undefined' && contentCheck && typeof contentObj !== 'undefined' && contentObj.category == 'content_busfaq') {
            //$('.breadcrumbs ul').append('<li itemprop="itemListElement" itemscope="" itemtype="http://schema.org/ListItem"><a itemprop="item" href="" class=""><span itemprop="name">'+contentObj.name+'</span></a></li>');
            // $(".current-page").html("<span itemprop='name'>"+v.displayTagName+"</span>");
                $(".current-page").html("<span itemprop='name'>AT&T Business support</span>");
        }
        if (typeof contentCheck !== 'undefined' && contentCheck) {
			//$(".current-page").html("<span itemprop='name'>" + $('#content .supporth1').text() + "</span>");
        }
        $(".current-page").show();
        $('.breadcrumbs ul li:last span img').hide();
        $('.breadcrumbs ul li:last a').addClass('no_line').removeAttr('href');
    },
    
    displaySubtopics = function (topicId) {
        var topicObj = findTopic(topicId);
        if(typeof(topicObj) !== 'undefined') {
            setTopicAndSubTopicDescription(topicObj);
            var parent = '"' + topicObj.displayTagName + '"';
            $("#content, .solutions").hide();
            $(".sub-topics .supporth1").text(topicObj.displayTagName);
            $(".sub-topics .mbtm30").text(topicObj.desc);
            
            $.each(topicObj.children, function (i, v) {
                var cont = "subtopic"
                var con = '"' + cont + '"';
                var vid = '"' + v.systemCode + '"';
                var vname = '"' + v.displayTagName + '"';
                var subNavUrl = window.location.pathname + '?' + cont + '#' + v.systemCode;    
                var rht_box = att.entbus.veracode.sanitizeHtml('<div class="rht_box" />');                              
                $(rht_box)
                    .append($('<h5><a class="topics_subnav" data-vid=' + vid + ' data-con=' + con + ' data-vname=' + vname + ' data-parent=' + parent + ' href="' + subNavUrl + '">' + v.displayTagName + '</a></h5>'))
                    .append('<p>' + ((typeof v.desc === 'undefined')? '' : v.desc) + '</p>')
                    .appendTo('.sub-topics');
            });
        }
    },
    
    displaySolutions = function (topicId) {
        $("#content, .sub-topics").hide();
        var topicObj = findTopic(topicId);
        if(typeof(topicObj) !== 'undefined') {
            setTimeout(function () {
                $(".sub-nav2>li>a").each(function () {
                    var clas = $(this).attr('class');
                    var compClas = clas.split(' ');
                    if (compClas[0] == topicId) {
                        $('.' + compClas[0])
                            .closest('ul')
                            .parent('li')
                            .find('a:first')
                            .addClass('active2');
                        $('.' + compClas[0])
                            .closest('ul')
                            .show();
                    }
                });
            }, 100);
            setTopicDescription(topicObj);
            var solutionsArr = getSolutions(topicId);
            if (topicObj) {
                $(".solutions h1").text(topicObj.displayTagName);
                $(".solutions .main-desc").text(topicObj.desc);
            }
            $.each(solutionsArr, function (i, v) {
                var cont, con, vid, topicId2, vname, category, cls, docType;
                
                cont = "content"
                con = '"' + cont + '"';
                vid = '"' + v.id + '"';
                topicId2 = '"' + topicId + '"';
                vname = '"' + v.Name + '"';
                category = v.Category;
                cls = getContentCategory(v.Name);
                docType = cls.toLowerCase();
                var dispContUrl = window.location.pathname + '?' + cont + '!' + v.id + '#'+ topicId;
                var vDesc = (typeof v.Desc === 'undefined');                
                var rht_box = att.entbus.veracode.sanitizeHtml('<div class="' + (vDesc?'rht_box_undef':'rht_box') + '" />');                              
                if (category == "content_weblink") {
                    //alert(v.Desc);
                    $(rht_box)
                        .append(att.entbus.veracode.sanitizeHtml("<div class='clearfix'><div class='doc-icon pull-left " + cls + "'></div><h5 class='mleft25'><a class='topics_dispcontent' data-vid=" + vid + "data-topicid=" + topicId2 + " href='javascript:void(0);'>" + v.Name + "</a></h5></div>"))
                        .append(att.entbus.veracode.sanitizeHtml("<p class='mleft25'>" + (vDesc? '' : v.Desc) + "</p>"))
                        .appendTo(att.entbus.veracode.sanitizeHtml(".solutions"));
                } else {
                    //alert(v.Name);
                    $(rht_box)
                        .append(att.entbus.veracode.sanitizeHtml("<div class='clearfix'><div class='doc-icon pull-left " + cls + "'></div><h5 class='mleft25'><a class='topics_content' data-vid=" + vid + "data-parent=" + topicId2 + " href='" + dispContUrl + "'>" + v.Name + "</a></h5></div>"))
                        .append(att.entbus.veracode.sanitizeHtml("<p class='mleft25'>" + (vDesc? '' : v.Desc) + "</p>"))
                        .appendTo(att.entbus.veracode.sanitizeHtml(".solutions"));
                }
            });
        }
    },

    displaySolutionsMenu = function (topicId, solutionId) {
        //$("#content, .sub-topics").hide();
        var topicObj = findTopic(topicId),
            activeLinkClass = '',
            liTagLen =  $("#breadcrumb-component ul li").length,
            liTag = '';

        if(typeof(topicObj) !== 'undefined') {
            setTopicDescription(topicObj);
            var solutionsArr = getSolutions(topicId);
			liTag = '<li itemprop="itemListElement" itemscope="" itemtype="https://schema.org/ListItem" class="breadcrumb path">' + 
                                '<meta itemprop="position" content="3">' + 
                                '<a href="/support/supportcenter.html?subtopic#' +  
                                 topicObj.parentTagName + '"' +
                                'class="att-track" data-slot="Breadcrumb Bar" data-content="Breadcrumb" data-name="Breadcrumb - AT&amp;T Support for Business Customers " itemprop="item">' + 
                            '</li>'            
            if (liTagLen == 3) $(liTag).insertBefore($(".current-page"));

            $(".current-page").html("<span itemprop='name'>" + topicObj.displayTagName + "</span>");
            if (topicObj) {
                $(".solutions h1").text(topicObj.displayTagName);
                $(".solutions .main-desc").text(topicObj.desc);
            }
            $("#content_support .support-head-right").text('Related content');
            $("#content_support .support-head-right").show();

            $.each(solutionsArr, function (i, v) {
                var cont, con, vid, topicId2, vname, category, cls, docType;
                cont = "content"
                con = '"' + cont + '"';
                vid = '"' + v.id + '"';
                topicId2 = '"' + topicId + '"';
                vname = '"' + v.Name + '"';
                category = v.Category;
                cls = getContentCategory(v.Name);
                docType = cls.toLowerCase();
                var dispContUrl = window.location.pathname + '?' + cont + '!' + v.id + '#'+ topicId;
                var vDesc = (typeof v.Desc === 'undefined');                
                var rht_box = att.entbus.veracode.sanitizeHtml('<div class="' + (vDesc?'rht_box_undef':'rht_box') + '" />'); 
                activeLinkClass = (v.id == solutionId)? ' active' : '';
                if (category == "content_weblink") {
                    $(rht_box)
                        .append(att.entbus.veracode.sanitizeHtml("<div class='clearfix'><h5 class='mleft25'><a class='topics_dispcontent' data-slot='Related Content' data-vid=" + vid + "data-topicid=" + topicId2 + " href='javascript:void(0);'>" + v.Name + "</a></h5></div>"))
                        //.append(att.entbus.veracode.sanitizeHtml("<p class='mleft25'>" + (vDesc? '' : v.Desc) + "</p>"))
                        .appendTo(att.entbus.veracode.sanitizeHtml(".support-nav-right"));
                } else {
                    $(rht_box)
                    .append(att.entbus.veracode.sanitizeHtml("<div class='clearfix'></div><h5 class='mleft25'><a class='topics_content" + activeLinkClass + "' data-slot='Related Content' data-vid=" + vid + "data-parent=" + topicId2 + " href='" + dispContUrl + "'>" + v.Name + "</a></h5></div>"))
                        //.append(att.entbus.veracode.sanitizeHtml("<p class='mleft25'>" + (vDesc? '' : v.Desc) + "</p>"))
                        .appendTo(att.entbus.veracode.sanitizeHtml(".support-nav-right"));
                }
            });

        }
    },        
    
    displayContent = function (solutionId, topicId, event = null) {
        var contentObj, 
            name,
            type,
            docType,
            doc;

/*
        solutionId = (typeof solutionId !== 'undefined') ? solutionId : $(this).data('vid');
        topicId = (typeof topicId !== 'undefined') ? topicId : $(this).data('topicid');
*/
        contentObj = getContent(solutionId);
        name = contentObj.name;
        type = '"' + getContentCategory(name) + '"';
        docType = type.toLowerCase();
        $('#assistance, hr.mbtm40').hide();
        if (docType == " video") {
            doc = 'VID';
        } else if (docType == ' pdf') {
            doc = 'PDF';
        } else {
            doc = 'TXT';
        }
        var contentFriendlyName = solutionId + '|' + doc + '|' + name;

        if (contentObj.category == 'content_weblink') {
            var destUrl = removeProtocol(contentObj.desktopurl);
            //adobe tracking for click event
            event === null ? '': adobePushEvent(contentFriendlyName, name, destUrl, event);
            window.open(contentObj.desktopurl);
        } else {
            $('.support-left-nav').hide();            
            $('body, html').scrollTop(0);
            $('.sub-topics, .solutions').hide();
            $('#content').show();
            $('#content .supporth1').text(contentObj.name);
            $('#content p.mbtm30').text(contentObj.desc);
            $('.static_content').html(contentObj.content);

            if (getCategory() == 'topic') {
                var subhref = $('.support-nav .nav').find('a.active').attr('href');
                $('.bread-topic').attr('href', subhref);
            } else {
                var subhref = $('.sub-nav2').find('a.active').attr('href');
                $('.bread-sub-topic').attr('href', subhref);
            }
            $('.bread-sub-topic').next('span').show();
            $('.bread-content > span').text(contentObj.name);
            $('.bread-sub-topic').removeClass('no_line');
            $('.bread-content').css('text-decoration', 'none');
			displaySolutionsMenu(topicId, solutionId);
        }

        setTimeout(function () {
            $(".sub-nav2>li>a").each(function () {
                var clas = $(this).attr('class');
                var compClas = clas.split(' ');
                if (compClas[0] == topicId) {
                    $('.' + compClas[0])
                        .closest('ul')
                        .parent('li')   
                        .find('a:first')
                        .addClass('active2');
                    $('.' + compClas[0])
                        .closest('ul')
                        .show();
                }
            });
        }, 100);        
    },
    
    setTopicAndSubTopicDescription = function (topicObj) {
        var subtopics,
            objArr;
        if(typeof(topicObj) !== 'undefined'){
            topicId = topicObj.systemCode;
            subtopics = topicObj.children;   
            objArr = [];
            for (i=0; i<subtopics.length; i++) {
                var subtopic = subtopics[i];
                $.ajax({
                    url: config.topicInfoUrl + subtopic.systemCode + '&app-id=gmarket',
                    type: 'GET',
                    dataType: 'json',
                    async: false,
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                }).done(function (data) {
                    if (data.resultBody.searchResults[0] != undefined && data.resultBody.searchResults[0].description != undefined) {
                        subtopic.desc=data.resultBody.searchResults[0].description;
                    } else {
                        subtopic.desc = '';
                    }
                });
            }
        }
    },
    
    setTopicDescription = function (topicObj) {
        var topicInfoArray;
        if(typeof(topicObj) !== 'undefined'){
            topicId = topicObj.systemCode;
            topicInfoArray = getTopicInfo();
            for (i = 0; i < topicInfoArray.length; i++) {
                if (topicObj.systemCode == topicInfoArray[i].id) {
                    topicObj.desc = topicInfoArray[i].desc;
                }
            }
        }
    },
    
    findTopic = function (topicId) {
        var topicObj;        
            for (i = 0; i < topicArray.length; i++) {
                topicObj = findRecursive(topicArray[i], topicId);
                if(topicObj != undefined ) {
                    return topicObj;
                }
            }
        return;
    },
    
    findRecursive = function (obj,topicId) {
        var i;
        if (obj.systemCode == topicId) {
            return obj;
        }
        if (obj.children != null){
            for (i = 0; i < obj.children.length; i++) {
                var child = findRecursive(obj.children[i],topicId);
                if (child != undefined) {
                    return child;
                }
            }
        }
        return;
    },
    
    getTopicInfo = function (topicIdArray) {
        var objArr = [],
            topicIdArray;
        topicIdArray = createTopicIdArray(topicArray);
        $.ajax({
            url: config.topicInfoUrl + topicIdArray[i] + '&app-id=gmarket',
            type: 'GET',
            dataType: 'json',
            async: false,
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
        }).done(function (data) {
            for (a = 0; a < data.resultBody.searchResults.length; a++) {
                objArr.push({
                    desc: data.resultBody.searchResults[a].description,
                    id: data.resultBody.searchResults[a].tags
                });
            }
        })
        return objArr;
    },
    
    createTopicIdArray = function (topicArray) {
        var topicIdArray = '',
            index;
        for (a = 0; a < topicArray.length; a++) {
            topicIdArray = topicIdArray + topicArray[a].systemCode;
                if (topicArray[a].children != null) {
                    for (b = 0; b < topicArray[a].children.length; b++) {
                        topicIdArray = topicIdArray + ',' + topicArray[a].children[b].systemCode;
                    }
                }
                topicIdArray = topicIdArray + ',';
            }
        index = topicIdArray.lastIndexOf(",");
        topicIdArray = topicIdArray.substring(0, index) + topicIdArray.substring(index + 1);
        return topicIdArray;
    },

    hasSubtopics = function (topicId) {
        var topicObj = findTopic(topicId);
        if(typeof(topicObj) !== 'undefined'){
            if (topicObj && topicObj.children != undefined && topicObj.children.length > 0) {
                return true;
            }
        }
        return false;
    },
    
    createBreadCrumbArr = function (topicId) {
        var topicObj = findTopic(topicId),
            arr, 
            i;
        if(typeof(topicObj) !== 'undefined'){
            breadCrumbArr.push(topicObj);
            getParent(topicObj);
            arr = [];
            for (i = (breadCrumbArr.length - 1); i >= 0; i--) {
                arr.push(breadCrumbArr[i]);
            }
            breadCrumbArr = arr;
        }
    },
    
    getParent = function (topicObj) {
        var parentTagName = topicObj?.parentTagName,
            parentObj;
        if (parentTagName == 'topic_enterprisesupport20') {
            return;
        }
        if(typeof(parentTagName) !== 'undefined'){
            parentObj = findTopic(parentTagName);
            breadCrumbArr.push(parentObj);
            getParent(parentObj);
        }
    },
    
    getSolutions = function (topicId) {
        var solutions = [];
        $.ajax({
            url: config.solutionsUrl + topicId + '&app-id=gmarket',
            type: 'GET',
            dataType: 'json',
            async: false,
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
        }).done(function (data) {
            for (var a = 0; a < data.resultBody.searchResults.length; a++) {
                solutions.push({
                    id: data.resultBody.searchResults[a].publishedId,
                    Name: data.resultBody.searchResults[a].title,
                    Desc: data.resultBody.searchResults[a].description,
                    Category: data.resultBody.searchResults[a].contentCategory
                });
            }
        });
        solutionsArray = solutions;
        return solutions;
    },
    
    findSolution = function (solutionId) {
        var solutionObj;
        for (i = 0; i < solutionsArray.length; i++) {
            if (solutionsArray[i].id == solutionId) {
                solutionObj = solutionsArray[i];
            }
        }
        return solutionObj;
    },
    
    getContent = function (solutionId) {
        var contentObj = {},
            solutionObj;
        $.ajax({
            url: config.contentUrl + solutionId + '?app-id=gmarket',
            type: 'GET',
            async: false,
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
        }).done(function (data) {
            contentObj.name = data.resultBody.title,
            contentObj.desc = data.resultBody.contentTypeProperties.shortdesc,
            contentObj.category = data.resultBody.contentType,              
            contentObj.content = data.resultBody.contentTypeProperties.answer,
            contentObj.desktopurl = data.resultBody.contentTypeProperties.desktopurl
            // OG and twitter title and description changes.
            $('meta[name="twitter:title"]').attr('content', data.resultBody.seoTitle);
            $('meta[name="twitter:description"]').attr('content', data.resultBody.seoDesc);
            $('meta[property="og:url"]').attr('content', window.location.href);
            $('meta[property="og:title"]').attr('content', data.resultBody.seoTitle);
            $('meta[property="og:description"]').attr('content', data.resultBody.seoDesc);
        })
        return contentObj;
    },
    
    mainNav = function (event) {
        var id  = $(this).data('vid');
        var con = $(this).data('con');
        var vname = $(this).data('vname');
        
        var url = window.location.origin + window.location.pathname + '?' + con + '#' + id,
            trackUrl = removeProtocol(url);
        mainNavTrack(vname, trackUrl, event);
        
        $(window).on('hashchange', function(e) {
            location.reload();
        });
    },
    
    subNav = function (event) {
        var id  = $(this).data('vid');
        var con = $(this).data('con');
        var vname = $(this).data('vname');
        var parent = $(this).data('parent');
        var slot = $(this).data('slot') || 'Body';
        
        var url = window.location.origin + window.location.pathname + '?' + con + '#' + id,
            trackUrl = removeProtocol(url);
        subNavTrack(vname, parent, slot, trackUrl, event);
        
        $(window).on('hashchange', function(e) {
            location.reload();
        });
    },
    
    content = function (event) {
        var id  = $(this).data('vid');
        var parent = $(this).data('parent');
        var vname = $(this).data('vname') || $(this).text();
        var slot = $(this).data('slot') || 'Body';        
        var url = window.location.origin + window.location.pathname + '?content!' + id + '#'+ parent,
            trackUrl = removeProtocol(url);
            subNavTrack(vname, parent, slot, trackUrl, event);
        $(window).on('hashchange', function(e) {
            location.reload();
        });
    },
    
    getSectionUrl = function (url) {
        cont1 = url.lastIndexOf('?');
        cont2 = url.substr(cont1 + 1);
        cont3 = cont2.substring(0, cont2.indexOf('#'));
        format = /[!]+/;
        if(format.test(cont3)) {
            co1 = cont3.split('!');
            cont4 = co1[0];
        } else {
            cont4 = cont3;
        }
        return cont4;
    },
    
    getContentId = function (url) {
        cont1 = url.lastIndexOf('!')
        cont2 = url.substr(cont1 + 1);
        cont3 = cont2.split('#');
        cont4 = cont3[0];
        return cont4;
    },
    
    getParameterByName = function (url) {
        var results, result1, str, str1;
        results = url.split('=');
        result1 = results[1].split('>');
        str = result1[0].replace("'", '');
        str1 = str.replace("'", '');
        return str1;
    },
    
    removeProtocol = function (url) {
        var results = url.split('//');
        var result1 = results[1];
        return result1;
    },
    
    getContentCategory = function (title) {
        var last = (typeof title !== 'undefined')? (title.substring(title.lastIndexOf('-') + 1, title.length)) : "";
        return last;
    },
    
    getCategory = function () {
        var url = window.location.href.split('?');
        var url2 = url[1].split('#');
        return url2[0];
    },
        
    init = function () {
        var breadTopic,
            breadSubTopic;
        topicArray = getTopics();
        display();
    },
        
    bindEvents = function () {
       $('.topics_main,.bread-topic').bind('click', mainNav);
       $('.topics_subnav,.bread-sub-topic').bind('click', subNav);
       $('.topics_dispcontent').bind('click', function(event) {
            displayContent($(this).data('vid'), $(this).data('topicid'), event);
       });
       $('.topics_content').bind('click', content);
    };

    $(document).ready(function () {
        init();
        bindEvents();
    });
})(jQuery.noConflict(), window, document);
