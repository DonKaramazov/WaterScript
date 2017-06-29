// ==UserScript==
// @name          GeckoScript - DVP I/O
// @author        Antoine 'Gecko' Pous <gecko@dvp.io>
// @licence       LGPL v3
// @description   Script ajoutant des fonctionalités à l'AnoChat, nécessite l'AnoCheat pour fonctionner
// @include       http://chat.developpez.com
// @include       http://chat.developpez.com/
// @include       http://chat.dvp.io
// @include       http://chat.dvp.io/
// @include       http://87.98.168.209
// @include       http://87.98.168.209/
// @include       http://178.32.150.5
// @include       http://178.32.150.5/
// @include       http://5.196.237.44
// @include       http://5.196.237.44/
// @include       http://5.135.21.60
// @include       http://5.135.21.60/
// @version       2.7.0
// @downloadURL   https://raw.githubusercontent.com/dvp-io/AnoCheat/master/GeckoScript.user.js
// @updateURL     https://raw.githubusercontent.com/dvp-io/AnoCheat/master/GeckoScript.user.js
// @website       http://dvp.io
// @grant         GM_info
// @run-at        document-idle
// ==/UserScript==

if(AC_version !== '2.5.1') {
  err = "GeckoScript ne supporte pas la version actuelle de l'AnoCheat, veuillez mettre le framework et le script à jour";
  alert(err);
  throw new Error(err);
}

if(version !== '3.0.3') {
  err = "GeckoScript ne supporte pas la version actuelle du chat, veuillez mettre le script à jour";
  alert(err);
  throw new Error(err);
}

GS_version = GM_info.script.version;

// Ajout de l'entrée du log pour le chargement du script
AC_logAdd('success',"GeckoScript v" + GM_info.script.version + " chargé");

// Préconfiguration des notifications, inactives par défaut
// sound = son sélectionné | sys = notification visuelle 0/1 | img = image custom pour la notif | msg = message custom pour la notif | title = titre custom pour la notif
if(!AC_configRead('GSNotificationsCenter')) {
  AC_configWrite('GSNotificationsCenter', {
    "userDice":{"sound":"","sys":0,"hide":0,"img":"","title":"","msg":""},
    "userLost":{"sound":"","sys":0,"hide":0,"img":"","title":"","msg":""},
    "userQuit":{"sound":"","sys":0,"hide":0,"img":"","title":"","msg":""},
    "userConn":{"sound":"","sys":0,"hide":0,"img":"","title":"","msg":""},
    "userReco":{"sound":"","sys":0,"hide":0,"img":"","title":"","msg":""},
    "userLeave":{"sound":"","sys":0,"hide":0,"img":"","title":"","msg":""},
    "userEnter":{"sound":"","sys":0,"hide":0,"img":"","title":"","msg":""},
    "msgPrivate":{"sound":"","sys":0,"img":"","title":"","msg":""},
    "msgHL":{"sound":"","sys":0,"img":"","title":"","msg":""},
    "msgNotice":{"sound":"","sys":0,"img":"","title":"","msg":""},
    "msgAnswer":{"sound":"","sys":0,"img":"","title":"","msg":""},
    "sysAlert":{"sound":"","sys":0,"img":"","title":"","msg":""},
    "sysWarn":{"sound":"","sys":0,"img":"","title":"","msg":""},
    "logSuccess":{"sound":"","sys":0,"img":"","title":"","msg":""},
    "logNotice":{"sound":"","sys":0,"img":"","title":"","msg":""},
    "logWarning":{"sound":"","sys":0,"img":"","title":"","msg":""},
    "logError":{"sound":"","sys":0,"img":"","title":"","msg":""}
  });
  AC_logAdd('warning', 'Chargement de la configuration par défaut du module de notification');
}

$("#barreOnglets").sortable({ revert: false, axis: 'x' });

// Nouveau color picker
$(".ColorPickerDivSample").replaceWith($("<input />").attr({type:"color",id:"geckolor",style:"height: 22px;width: 20px;border: 1px solid #CCC;background: linear-gradient(to bottom, #fcfcfc 0%,#e0e0e0 100%);border-radius: 12px;"}).val(couleurInitiale));

$('#geckolor').on('change', function(e) {
  var _color = $(this).val();
  envoyerCommande('/COLOR ' + _color);
  AC_logAdd('notice', 'Tu viens de changer de couleur ma gueule <span style="color:' + _color + ';">' + _color + '</span>');
  focusZoneSaisie();
});

// Création du sélecteur de style
AC_cssAdd('#dvpio_style{margin:0 5px;}');
$('<select />').attr('id','dvpio_style').insertBefore('#selecteurCouleur').on('change', function() {
  if(optionsChat.indexOf('M') > -1) {
    envoyerCommande('/mode -m');
  }
  var modeC = optionsChat.indexOf('C') > -1 ? ' compact ' : ' ';
  var cls = this.value === '-1' ? 'fondblanc' + modeC : modeC + this.value;
  $('body').attr('class', cls);
  focusZoneSaisie();
  AC_logAdd('notice', 'Style `' + this.options[this.selectedIndex].text + '` sélectionné');
});

// Ajout du choix par défaut
$('<option />').attr('value','-1').text('AnoChat v3').appendTo('#dvpio_style');

// rend le BBCode JOIN compatible avec l'auto complétion
GS_bbJoin = function(m, p1, offset, str) {
  return "[JOIN]" + p1.trim() + "[/JOIN]";
};

// Méthode de déclaration d'un nouveau style
GS_styleAdd = function(cls, name, css) {
  $('<option />').attr('value',cls).text(name).appendTo('#dvpio_style');
  AC_cssAdd(css);
};

$('body').append('<div id="GSUINC" style="height:247px;width:auto;min-height:0" class="ui-dialog-content ui-widget-content" scrolltop="0" scrollleft="0"><img src="/smileys/14405-e714.jpg" width="50" height="50" data-image="P" style="float:right"><p> Bienvenue dans le centre de notifications. <br /> Ici vous pouvez gérer de manière avancée les notifications du chat. <br /><br /><i><a href="https://github.com/dvp-io/AnoCheat/issues" title="Accéder au tracker" target="_blank">Si vous rencontrez un bug ou pour toute suggestion ouvrez un ticket sur le tracker du projet, merci !</a></i></p><form id="GSUINCForm"><p> Type de notification à configurer : <select id="GSUINCType" name="type"><option selected disabled>--- Faites un choix ---</option><optgroup label="Système"><option value="sysAlert">Alerte</option><option value="sysWarn">Avertissement reçu</option></optgroup><optgroup label="Messages"><option value="msgPrivate">MP reçu</option><option value="msgHL">HL reçu</option><option value="msgNotice">Notice reçue</option><option value="msgAnswer">Réponse reçue</option></optgroup><optgroup label="Notifications salon"><option value="userDice">Dice</option><option value="userConn">Connexion</option><option value="userQuit">Déconnexion</option><option value="userReco">Reconnexion</option><option value="userLost">Connexion perdue</option><option value="userLeave">Quitte le salon</option><option value="userEnter">Entre dans le salon</option></optgroup><optgroup label="Logs des scripts" disabled><option value="logSuccess">Success</option><option value="logNotice">Info</option><option value="logSuccess">Warning</option><option value="logError">Error</option></optgroup></select></p><fieldset><legend><input type="checkbox" name="sys"> Notification système</legend><i>Ces notifications permettent d\'être notifié même quand un autre logiciel est au premier plan.</i><p> Titre personnalisé <input type="text" name="title" disabled><br /><i><small>Le titre personnalisé vous permet de rendre la notification plus discrète.</small></i></p><p> Message personnalisé <input type="text" name="msg" disabled><br /><i><small>Le message personnalisé vous permet de rendre la notification plus discrète.</small></i></p><p> Image personnalisée (url ou base64) <input type="text" name="img" disabled><br /><i><small>L\'image personnalisée vous permet de rendre la notification plus discrète. Si vous êtes derrière un proxy, privilégiez l\'utilisation du base64 du fichier.</small></i></p></fieldset><fieldset><legend><input type="checkbox" name="hide" disabled> Masquer la notification dans le salon (<span style="color:red">Actuellement indisponible</span>)</legend><i>Cette option permet de masquer les notifications directement dans le salon, ne fonctionne que pour les notifications du groupe <b>Notifications salon.</b></i><p> Comment masquer la notification: <select disabled><option selected>Toujours masquer</option><option>N\'afficher que la dernière notification de ce type</option><option>N\'afficher que la dernière notification de l\'utilisateur</option></select></p></fieldset><fieldset><legend><input type="checkbox" name="snd"> Notification sonore</legend><i>Permet de jouer un son lors de la notification</i><p> Son émis : <select name="sound"></select><br /><i><small>Pour ajouter un son rendez-vous dans le gestionnaire de sons ;o</small></i></p></fieldset><p style="text-align:center"><button id="GSUINCTest" class="bouton" type="button">Tester</button>&nbsp;<button id="GSUINCReg" class="bouton boutonalt" type="button">Enregistrer</button></p></form></div>');
$('#GSUINC').dialog({ autoOpen: false, open: function() {
    AC_UIReset('#GSUINCForm');
    $('#GSUINCForm select[name="sound"]').find('option').remove();
    $.each(AC_soundLibrary, function(name, obj) {
        $('#GSUINCForm select[name="sound"]').append(
            $('<option />').text(name).attr({"value": name})
        );
    });
}, title: "Centre de notifications", resizable: false, width: 707, height: 740});
AC_menuAdd('Centre de notifications', 'Gérez facilement vos notifications', function() { $('#GSUINC').dialog("open"); });

$('#GSUINCType').on('change', function() {

  var type = $(this).find('option:selected').val();
  var name = $(this).find('option:selected').text();
  var cfg = AC_configRead('GSNotificationsCenter')[type];

  $('b.GSUINCType').text(name);
  $('#GSUINCForm input[name="title"]').val(cfg.title);
  $('#GSUINCForm input[name="msg"]').val(cfg.msg);
  $('#GSUINCForm input[name="img"]').val(cfg.img);

  if(typeof cfg.sys !== "undefined") {
    $('#GSUINCForm input[name="sys"]').on('change', function() {
      if($(this).is(':checked')) {
        $('#GSUINCForm input[name="title"], #GSUINCForm input[name="msg"], #GSUINCForm input[name="img"]').attr({"disabled": false});
      } else {
        $('#GSUINCForm input[name="title"], #GSUINCForm input[name="msg"], #GSUINCForm input[name="img"]').attr({"disabled": true});
      }
    });
  }
  $('#GSUINCForm input[name="sys"]').attr('checked', cfg.sys === 1).trigger("change");

  var soundSelected = cfg.sound !== "" ? cfg.sound : "Beep";
  $('#GSUINCForm select[name="sound"] option[value="' + soundSelected + '"]').attr({"selected": true});
  $('#GSUINCForm input[name="snd"]').attr({"checked": cfg.sound !== "" });
  $('#GSUINCForm input[name="snd"]').on('change', function() {
      if($(this).is(':checked')) {
        $('#GSUINCForm select[name="sound"]').attr({"disabled": false});
      } else {
        $('#GSUINCForm select[name="sound"]').attr({"disabled": true});
      }
  });
  $('#GSUINCForm input[name="snd"]').attr('checked', cfg.sound !== "").trigger("change");

  /*var $elHide = $('#GSUINCForm input[name="hide"]');
  if(typeof cfg.hide === 'undefined') {
    $elHide.attr({"checked": false, "disabled": true});
  } else {
    $elHide.attr({"checked": (cfg.hide > 0), "disabled": false });
  }*/

});

// Quand on enregistre la nouvelle configuration
$('#GSUINCReg').on('click', function() {
  var newCfg = $('#GSUINCForm').serializeJSON();
  var type = $('#GSUINCType').find('option:selected').val();
  var cfg = AC_configRead('GSNotificationsCenter');
  var name = $('#GSUINCType').find('option:selected').text();

  cfg[type].sys = newCfg.sys && newCfg.sys === "on" ? 1 : 0;
  cfg[type].img = newCfg.img;
  cfg[type].title = newCfg.title;
  cfg[type].msg = newCfg.msg;
  cfg[type].sound = newCfg.snd && newCfg.snd === "on" ? newCfg.sound : "";
  AC_configWrite('GSNotificationsCenter', cfg);
  AC_notifyBrowser({"title": "Centre de notifications", "msg": name + "\nConfiguration enregistrée", "img": null});
  focusZoneSaisie();
});

// Quand on lance un live test
$('#GSUINCTest').on('click', function() {
  var cfg = $('#GSUINCForm').serializeJSON();

  if(cfg.sys)
    AC_notifyBrowser({"title": cfg.title || 'Titre notification', "msg": cfg.msg || 'Contenu de la notification', "img": cfg.img || null});

  if(cfg.snd)
    AC_soundPlay($('#GSUINCForm select[name="sound"]').find('option:selected').val());

 focusZoneSaisie();
});

var GS_back = {};
var GS_iback = {};

function GS_getNextMsg(room) {

  // Si on à aucun histo pour ce salon on ne fait rien
  if(typeof GS_back[room] === "undefined" || GS_back[room].length === 0) {
    return false;
  }

  // Si on à pas de pointeur ou qu'on est au bout du rouleau
  if(typeof GS_iback[room] === "undefined" || ++GS_iback[room] === GS_back[room].length) {
    GS_iback[room] = 0;
  }

  // Si le message existe bien
  if(typeof GS_back[room][GS_iback[room]] !== "undefined") {
    // On injecte le message dans la zone de saisie
    $("#zoneSaisie").val(GS_back[room][GS_iback[room]]);
  }
}

function GS_getPrevMsg(room) {

  // Si on à aucun histo pour ce salon on ne fait rien
  if(typeof GS_back[room] === "undefined" || GS_back[room].length === 0) {
    return false;
  }

  // Si on à pas de pointeur ou qu'on est au bout du rouleau
  if(typeof GS_iback[room] === "undefined" || --GS_iback[room] < 0) {
    GS_iback[room] = GS_back[room].length -1;
  }

  // Si le message existe bien
  if(typeof GS_back[room][GS_iback[room]] !== "undefined") {
    // On injecte le message dans la zone de saisie
    $("#zoneSaisie").val(GS_back[room][GS_iback[room]]);
  }
}

function GS_setBack(room, msg) {
  if(typeof GS_back[room] === 'undefined') {
    GS_back[room] = [];
  }
  GS_back[room].unshift(msg);
}



// Ajout des styles validés
GS_styleAdd('monochrome', 'Monochrome','.monochrome,.monochrome :not(.ui-dialog-titlebar-close):not(.fermeture):not(#quitterChat):not(.icone):not(#reduireListe):not(#boutonMenuChat):not(.horodatage):not(.cocheInvisible){color:#000!important;background:#fff!important;text-shadow:none!important;box-shadow:0 0!important;border-color:#000!important}.monochrome * .ongletActivite{border-style:dotted!important}.monochrome * .ongletActivite table:first-child{font-style:italic!important}.monochrome * .ongletMessage{border-style:dashed!important}.monochrome * .ongletMessage table:first-child{text-decoration:underline!important}.monochrome * #boutonMenuChat,.monochrome * #quitterChat,.monochrome * #reduireListe,.monochrome * .fermeture,.monochrome * .horodatage,.monochrome * .icone,.monochrome * .ui-dialog-titlebar-close,.monochrome * img,.monochrome img{-moz-filter:grayscale(100%);-ms-filter:grayscale(100%);-o-filter:grayscale(100%);filter:gray;-webkit-filter:grayscale(100%)}.monochrome * .ColorPickerDivSample{display:none!important}.monochrome * .elementcomplsel{text-decoration:underline}.monochrome #menuChat a:hover,.monochrome #menuConversation a:hover,.monochrome #menuUtilisateur a:hover{text-decoration:underline;border-radius:initial}.monochrome #menuChat,.monochrome #menuConversation,.monochrome #menuUtilisateur{border:1px solid #000}.monochrome #menuChat * span.cocheInvisible{color:#fff}.monochrome * .titreCadre{border-top:1px solid;border-left:1px solid;border-right:1px solid}.monochrome * #barreStatut,.monochrome * .conversation{border-top:1px solid}');
GS_styleAdd('console', 'Console', '.console,.console :not(.ui-dialog-titlebar-close):not(.fermeture):not(#quitterChat):not(.icone):not(#reduireListe):not(#boutonMenuChat):not(.horodatage):not(.cocheInvisible){color:#fff!important;background:#000!important;text-shadow:none!important;box-shadow:0 0!important;border-color:#fff!important}.console * .ongletActivite{border-style:dotted!important}.console * .ongletActivite table:first-child{font-style:italic!important}.console * .ongletMessage{border-style:dashed!important}.console * .ongletMessage table:first-child{text-decoration:underline!important}.console * #boutonMenuChat,.console * #quitterChat,.console * #reduireListe,.console * .fermeture,.console * .horodatage,.console * .icone,.console * .ui-dialog-titlebar-close,.console * img,.console img{-moz-filter:grayscale(100%);-ms-filter:grayscale(100%);-o-filter:grayscale(100%);filter:gray;-webkit-filter:grayscale(100%)}.console * .ColorPickerDivSample{display:none!important}.console * .elementcomplsel{text-decoration:underline}.console #menuChat a:hover,.console #menuConversation a:hover,.console #menuUtilisateur a:hover{text-decoration:underline;border-radius:initial}.console #menuChat,.console #menuConversation,.console #menuUtilisateur{border:1px solid #fff}.console #menuChat * span.cocheInvisible{color:#000}.console * .titreCadre{border-top:1px solid;border-left:1px solid;border-right:1px solid}.console * #barreStatut,.console * .conversation{border-top:1px solid}');
GS_styleAdd('magicGecko', 'Magic Gecko', '@-moz-keyframes magicGecko{from{background-position:top left}to{background-position:top right}}@-webkit-keyframes magicGecko{from{background-position:top left}to{background-position:top right}}@-o-keyframes magicGecko{from{background-position:top left}to{background-position:top right}}@-ms-keyframes magicGecko{from{background-position:top left}to{background-position:top right}}@-khtml-keyframes magicGecko{from{background-position:top left}to{background-position:top right}}@keyframes magicGecko{from{background-position:top left}to{background-position:top right}}.magicGecko * a.nomSalon,.magicGecko * a.nomSalon:hover,.magicGecko * input,.magicGecko * input:hover{background-image:-webkit-linear-gradient(left,red,orange,#ff0,green,#00f,indigo,violet,indigo,#00f,green,#ff0,orange,red);background-image:-moz-linear-gradient(left,red,orange,#ff0,green,#00f,indigo,violet,indigo,#00f,green,#ff0,orange,red);background-image:-o-linear-gradient(left,red,orange,#ff0,green,#00f,indigo,violet,indigo,#00f,green,#ff0,orange,red);background-image:-ms-linear-gradient(left,red,orange,#ff0,green,#00f,indigo,violet,indigo,#00f,green,#ff0,orange,red);background-image:-khtml-linear-gradient(left,red,orange,#ff0,green,#00f,indigo,violet,indigo,#00f,green,#ff0,orange,red);background-image:linear-gradient(left,red,orange,#ff0,green,#00f,indigo,violet,indigo,#00f,green,#ff0,orange,red);animation:magicGecko .5s forwards linear infinite;background-size:50% auto;-webkit-background-clip:text;-moz-background-clip:text;-o-background-clip:text;-ms-background-clip:text;-khtml-background-clip:text;background-clip:text;color:transparent!important}');

/* Réponse optimisée
 * Permet de répondre à un message en double cliquant dessus
 */
document.querySelector('#conversations').addEventListener('dblclick', function(e) {

  // Si on est sur un id `msg(\d+)`
  if(e.target.parentElement.id !== "" && /^msg(\d+)/.test(e.target.parentElement.id)) {

    var zs = document.getElementById('zoneSaisie'),
      tid = e.target.parentElement.id,
      msg = e.target.parentElement.innerText !== undefined ? e.target.parentElement.innerText : e.target.parentElement.textContent;

    // Si ctrl est pressé on cite le message
    if(e.ctrlKey || e.metaKey) {
      zs.value = zs.value + "[QUOTE]" + msg;
      focusZoneSaisie();
      return;
    }

    // Si shift est pressé on envoie une alerte aux modérateurs
    if(e.shiftKey) {
      zs.value = "/ALERT [@" + tid + "][QUOTE]" + msg;
      focusZoneSaisie();
      return;
    }

    // Si alt est pressé on supprime le message
    if(e.altKey) {
      supprimer(tid);
      return;
    }

  }
});

// on écoute les réponses AJAX
$(document).ajaxComplete(function(event, xhr, settings){

  if(settings.url == 'ajax.php') {

    var data = $.parseJSON(xhr.responseText);

      if(data == null)
          return;

    // Si on est sur un MP
    if(data.pvs.length > 0) {

      $.each(data.pvs, function(i, pm) {

        var $html = $(pm.html);
        var msg = $html.find('span.contenu').text();
        var tab = '#onglet' + pm.id;
        var cfg = {"notifs": AC_configRead('GSNotificationsCenter')};

        if(pm.id === '-1') {

          if(pm.html.match(/(\[Alerte aux modérateurs\])/gi)) {
            AC_notifyBrowser('Alerte modération', msg);
          } else if(!msg.startWith('[' + pseudo + ']') && !msg.startWith('[ ' + pseudo + ']') && !msg.startWith('[' + pseudo + ' ]')) {

            if(cfg.notifs.msgPrivate.sys === 1)
              AC_notifyBrowser({"title": cfg.notifs.msgPrivate.title || "@", "msg": cfg.notifs.msgPrivate.msg || msg, "img": cfg.notifs.msgPrivate.img || null});

            if(cfg.notifs.msgPrivate.sound !== "")
              AC_soundPlay(cfg.notifs.msgPrivate.sound);
          }

        } else {

          if(!msg.startWith('[' + pseudo + ']') && !msg.startWith('[ ' + pseudo + ']') && !msg.startWith('[' + pseudo + ' ]')) {

            if(cfg.notifs.msgPrivate.sys === 1)
              AC_notifyBrowser({"title": cfg.notifs.msgPrivate.title || "Message privé reçu", "msg": cfg.notifs.msgPrivate.msg || msg, "img": cfg.notifs.msgPrivate.img || null});

            if(cfg.notifs.msgPrivate.sound !== "")
              AC_soundPlay(cfg.notifs.msgPrivate.sound);
          }

        }

      });

    }

    if(data.salon.length > 0) {

      $.each($(data.salon), function(i, div) {

        var msg = $(div).find('span.contenu').text();
        var sys = $(div).find('span.notification').text();
        var art = $(div).find('span.alerte').text();
        var adv = $(div).find('span.avertissement').text();
        var not = $(div).find('span.notice').text();
        var ind = $(div).find('span.indicateur').text();

        var cfg = {"notifs": AC_configRead('GSNotificationsCenter')};

        if(sys.length > 0) {

          var userLost = sys.match(/([a-z0-9\s_-]+)\sa\squitté\sle\sChat\s\(Ne\ssemble\splus\sconnecté\(e\)\)./im);
          var userQuit = sys.match(/([a-z0-9\s_-]+)\sa\squitté\sle\sChat\s\(Sortie\)./im);
          var userConn = sys.match(/([a-z0-9\s_-]+)\sa\srejoint\sle\sChat./im);
          var userReco = sys.match(/([a-z0-9\s_-]+)\sa\srejoint\sle\sChat\s\(Reconnexion\sautomatique\)./im);
          var userLeave = sys.match(/([a-z0-9\s_-]+)\sest\sallé\(e\)\sdans\sun\sautre\ssalon./im);
          var userEnter = sys.match(/([a-z0-9_]+)\sa\srejoint\sle\ssalon\s\[(.*)\]./im);
          var userDice = sys.match(/([a-z0-9_]+)\sa\slancé\sun\sd([0-9]+). Résultat : ([0-9]+)./im);

          if(userLost) {

            $("#" + div.id).addClass('GSuserLost AC' + userLost[1].hash());

              var specialUser = SpecialUser(userQuit[1],'a perdu sa connexion');

               if(cfg.notifs.userConn.sys === 1)
               AC_notifyBrowser(
                   {
                    "title": cfg.notifs.userLost.title || specialUser.title || userQuit[1],
                    "msg": cfg.notifs.userLost.msg || specialUser.msg || 'Connexion perdue',
                    "img": cfg.notifs.userLost.img || specialUser.img || null
                   });

              //ancien script gecko
            // if(cfg.notifs.userLost.sys === 1)
            //   AC_notifyBrowser({"title": cfg.notifs.userLost.title || userLost[1], "msg": cfg.notifs.userLost.msg || 'Connexion perdue', "img": cfg.notifs.userLost.img || null});

            if(cfg.notifs.userLost.sound !== "")
              AC_soundPlay(cfg.notifs.userLost.sound);
          }

          if(userQuit) {

            $("#" + div.id).addClass('GSuserQuit AC' + userQuit[1].hash());

             var specialUser = SpecialUser(userQuit[1],'vient de se deconnecté(e)');

              if(cfg.notifs.userConn.sys === 1)
               AC_notifyBrowser(
                   {
                    "title": cfg.notifs.userQuit.title || specialUser.title || userQuit[1],
                    "msg": cfg.notifs.userQuit.msg || specialUser.msg || 'Deconnecté(e)',
                    "img": cfg.notifs.userQuit.img || specialUser.img || null
                   });

            // ancien script gecko
            // if(cfg.notifs.userQuit.sys === 1)
            //   AC_notifyBrowser({"title": cfg.notifs.userQuit.title || userQuit[1], "msg": cfg.notifs.userQuit.msg || MessageSpecial(userQuit[1],'Déconnecté(e)'), "img": cfg.notifs.userQuit.img || null});

            if(cfg.notifs.userQuit.sound !== "")
              AC_soundPlay(cfg.notifs.userQuit.sound);
          }

          if(userReco) {

            $("#" + div.id).addClass('GSuserReco AC' + userReco[1].hash());

              var specialUser = SpecialUser(userReco[1],'vient de se reconnecté(e)');

              if(cfg.notifs.userConn.sys === 1)
               AC_notifyBrowser(
                   {
                    "title": cfg.notifs.userReco.title || specialUser.title || userReco[1],
                    "msg": cfg.notifs.userReco.msg || specialUser.msg || 'Reconnecté(e)',
                    "img": cfg.notifs.userReco.img || specialUser.img || null
                   });

            // ancien script gecko
            // if(cfg.notifs.userReco.sys === 1)
            //   AC_notifyBrowser({"title": cfg.notifs.userReco.title || userReco[1], "msg": cfg.notifs.userReco.msg || 'Reconnecté(e)', "img": cfg.notifs.userReco.img || null});

            if(cfg.notifs.userReco.sound !== "")
              AC_soundPlay(cfg.notifs.userReco.sound);

          } else if(userConn) {

            $("#" + div.id).addClass('GSuserConn AC' + userConn[1].hash());

              var specialUser = SpecialUser(userConn[1],'vient de se connecté(e)');

              if(cfg.notifs.userConn.sys === 1)
               AC_notifyBrowser(
                   {
                    "title": cfg.notifs.userConn.title || specialUser.title || userConn[1],
                    "msg": cfg.notifs.userConn.msg || specialUser.msg || 'Connecté(e)',
                    "img": cfg.notifs.userConn.img || specialUser.img || null
                   });

            // Ancien script gecko
            // if(cfg.notifs.userConn.sys === 1)
            //   AC_notifyBrowser({"title": cfg.notifs.userConn.title || userConn[1], "msg": cfg.notifs.userConn.msg || ' Connecté(e)', "img": cfg.notifs.userConn.img || null});

            if(cfg.notifs.userConn.sound !== "")
              AC_soundPlay(cfg.notifs.userConn.sound);
          }

          if(userLeave) {

            $("#" + div.id).addClass('GSuserLeave AC' + userLeave[1].hash());

              var specialUser = SpecialUser(userLeave[1],'a quitté le salon');

              if(cfg.notifs.userConn.sys === 1)
               AC_notifyBrowser(
                   {
                    "title": cfg.notifs.userLeave.title || specialUser.title || userLeave[1],
                    "msg": cfg.notifs.userLeave.msg || specialUser.msg || 'A quitté le salon',
                    "img": cfg.notifs.userLeave.img || specialUser.img || null
                   });

            // ancien script gecko
            // if(cfg.notifs.userLeave.sys === 1)
            //   AC_notifyBrowser({"title": userLeave[1], "msg": cfg.notifs.userLeave.msg || 'A quitté le salon', "img": cfg.notifs.userLeave.img || null});

            if(cfg.notifs.userLeave.sound !== "")
              AC_soundPlay(cfg.notifs.userLeave.sound);
          }

          if(userEnter) {

            $("#" + div.id).addClass('GSuserEnter AC' + userEnter[1].hash());

             var specialUser = SpecialUser(userEnter[1],'a rejoint le salon');

              if(cfg.notifs.userConn.sys === 1)
               AC_notifyBrowser(
                   {
                    "title": cfg.notifs.userEnter.title || specialUser.title || userEnter[1],
                    "msg": cfg.notifs.userEnter.msg || specialUser.msg || 'A rejoint le salon',
                    "img": cfg.notifs.userEnter.img || specialUser.img || null
                   });

            // ancien script gecko
            // if(cfg.notifs.userEnter.sys === 1)
            //   AC_notifyBrowser({"title": cfg.notifs.userEnter.title || userEnter[1], "msg": cfg.notifs.userEnter.msg || 'A rejoint le salon', "img": cfg.notifs.userEnter.img || null});

            if(cfg.notifs.userEnter.sound !== "")
              AC_soundPlay(cfg.notifs.userEnter.sound);
          }

          if(userDice) {

            $("#" + div.id).addClass('GSuserDice AC' + userDice[1].hash());

            if(cfg.notifs.userDice.sys === 1)
              AC_notifyBrowser({"title": cfg.notifs.userDice.title || userDice[1] + " a lancé un d" + userDice[2], "msg": cfg.notifs.userDice.msg || "Résultat: "+userDice[3], "img": cfg.notifs.userDice.img || null});

            if(cfg.notifs.userDice.sound !== "")
              AC_soundPlay(cfg.notifs.userDice.sound);
          }


        } else if(art.length > 0) {

          if(cfg.notifs.sysAlert.sys === 1)
            AC_notifyBrowser({"title": cfg.notifs.sysAlert.title || 'Alerte salon', "msg": cfg.notifs.sysAlert.msg || art, "img": cfg.notifs.sysAlert.img || null});

          if(cfg.notifs.sysAlert.sound !== "")
            AC_soundPlay(cfg.notifs.sysAlert.sound);

        } else if(not === "Notice reçue :") {

          if(cfg.notifs.msgNotice.sys === 1)
            AC_notifyBrowser({"title": cfg.notifs.msgNotice.title || 'Notice reçue', "msg": cfg.notifs.msgNotice.msg || msg, "img": cfg.notifs.msgNotice.img || null});

          if(cfg.notifs.msgNotice.sound !== "")
            AC_soundPlay(cfg.notifs.msgNotice.sound);

        } else if(adv.length > 0) {

          if(cfg.notifs.sysWarn.sys === 1)
            AC_notifyBrowser({"title": cfg.notifs.sysWarn.title || 'Avertissement reçu', "msg": cfg.notifs.sysWarn.msg || adv, "img": cfg.notifs.sysWarn.img || null});

          if(cfg.notifs.sysWarn.sound !== "")
            AC_soundPlay(cfg.notifs.sysWarn.sound);

        } else if(ind === "◆") {

          if(cfg.notifs.msgHL.sys === 1)
            AC_notifyBrowser({"title": cfg.notifs.msgHL.title || 'HL reçu', "msg": cfg.notifs.msgHL.msg || msg, "img": cfg.notifs.msgHL.img || null});

          if(cfg.notifs.msgHL.sound !== "")
            AC_soundPlay(cfg.notifs.msgHL.sound);

        } else if(ind === "◈") {

          if(cfg.notifs.msgAnswer.sys === 1)
            AC_notifyBrowser({"title": cfg.notifs.msgAnswer.title || 'Réponse reçue', "msg": cfg.notifs.msgAnswer.msg || msg, "img": cfg.notifs.msgAnswer.img || null});

          if(cfg.notifs.msgAnswer.sound !== "")
            AC_soundPlay(cfg.notifs.msgAnswer.sound);

        }

      });

    }

    if(data.connectes.length > 0) {

      $("#geckolor").val(couleurInitiale);

    }

  }

});

/* ~~~~~~~~~~~~~~~~~~ WATERSCRIPT BEGIN ~~~~~~~~~~~~~~~~~~~~~ */

// Methode qui retourne un objet pour l'utilisateur
// - Titre
// - surnom / phrase d'accroche
// - suffix => contexte de la commande ( co , déco , entre , part ... )
// - image => prévilégié le base64 pour ceux qui sont derrière un proxy
function SpecialUser(user,suffix) {
    var specialUser;
      switch(user)
         {
                  case "Khorese":
                      specialUser = new MakeSpecialUser(user,'PLS',suffix,imageDico['pls']);
                      break;
                  case "mermich":
                      specialUser = new MakeSpecialUser(user,'Modeste mais surpuissant',suffix,imageDico['burns']);
                      break;
                  case "Dr_Frankenstein":
                      specialUser = new MakeSpecialUser(user,'Franky le moche',suffix,imageDico['frankeinstein']);
                      break;
                  case "dragonjoker59":
                      specialUser = new MakeSpecialUser(user,'Castor 3D',suffix,imageDico['dragonjoker']);
                      break;
                  case "WaterTwelve21":
                     specialUser = new MakeSpecialUser(user,'Don Water12',suffix,imageDico['kuja']);
                     break;
                  case "isador34":
                   specialUser = new MakeSpecialUser(user,'PAR LE FEUX SOYEZ PURIFIEE',suffix,imageDico['ragnaros']);
                   break;
             default:
                 specialUser = new MakeSpecialUser(user,user,suffix,null);
                 break;
                 /*
                    [...]
                 */

         }

    return specialUser;

}

// Constructeur de l'objet
// si l'image est nul , on a l'image de dvp par défaut
function MakeSpecialUser(title,msg,suffix,img){
    this.title = title;
    this.msg = msg + " " + suffix;
    this.img = imageExists(img) ? img : null;

    return this;
}

// Test si l'url de l'image est valide (A testé pour le base64)
// XMLHttp deprécié TODO -- trouvé une alternative
function imageExists(image_url){

    if(image_url === undefined || image_url === null)
        return false;

    var http = new XMLHttpRequest();

    http.open('HEAD', image_url, false);
    http.send();

    return http.status != 404;

}

//Tableau qui contient les imagess
// Ajouter vos images ici
// en paramtres des methodes ex: imageDico['pls']
// site pour convertir vos image en base64 https://www.base64-image.de/
var imageDico =
    {
        pls: 'data:image/png;base64,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',
        ragnaros : 'data:image/jpeg;base64,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', 
        burns : 'data:image/jpeg;base64,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',
        kuja : 'data:image/jpeg;base64,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',
        frankeinstein : 'data:image/jpeg;base64,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',
        dragonjoker : 'data:image/jpeg;base64,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',
    };

/* ~~~~~~~~~~~~~~~~~~ WATERSCRIPT END ~~~~~~~~~~~~~~~~~~~~~ */

// On écoute la modification du DOM
document.addEventListener("DOMSubtreeModified", function(e) {

  var target = e.target || e.srcElement;

}, false);

// Binds
document.addEventListener('keydown', function(e) {
  var charCode = e.which || e.keyCode;
  $roomID = $('.conversation:visible').attr('id');

  if((e.ctrlKey || e.metaKey) && charCode === 40) {
    if($('#zoneSaisie').is(':visible')) {
      masquerBas();
      AC_logAdd('notice', 'Zone de saisie masquée');
    } else {
      afficherBas();
      AC_logAdd('notice', 'Zone de saisie affichée');
    }
  }

  if(e.altKey && charCode === 39) {
    if($('#connectes').is(':visible')) {
      masquerDroite();
      AC_logAdd('notice', 'Liste des membres masquée');
    } else {
      afficherDroite();
      AC_logAdd('notice', 'Liste des membres affichée');
    }
  }

  if(e.altKey && charCode === 38 && $('#zoneSaisie').is(':focus')) {
    GS_getPrevMsg($roomID);
  }

  if(e.altKey && charCode === 40 && $('#zoneSaisie').is(':focus')) {
    GS_getNextMsg($roomID);
  }

});

$("#zoneSaisie").preBind("keydown", function (e) {

  var charCode = e.which || e.keyCode;
  $zoneSaisieData = $(this).val();
  $roomID = $('.conversation:visible').attr('id');

  if(charCode === 13) {

    if($zoneSaisieData !== '') {
      // Clean le bbcode JOIN pour être compatible avec l'autocompletion
      $(this).val($zoneSaisieData.replace(/\[join\](?:\s|)(.*)(?:\s|)\[\/join\]/i, GS_bbJoin));

      // On ajoute une entrée dans l'historique personnel
      GS_setBack($roomID, $zoneSaisieData);
    }

  }
});
