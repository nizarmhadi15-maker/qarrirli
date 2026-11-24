/* روابط المشاهدة الرسمية: يحوّل منصة TMDB إلى رابط بحث مباشر داخل المنصة نفسها (منصات قانونية فقط) */
(function () {
  var Q = encodeURIComponent;
  var P = [
    [/netflix/i, function (t) { return "https://www.netflix.com/search?q=" + Q(t); }],
    [/amazon|prime video/i, function (t) { return "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=" + Q(t); }],
    [/disney/i, function (t) { return "https://www.disneyplus.com/search?q=" + Q(t); }],
    [/apple tv|itunes|apple/i, function (t) { return "https://tv.apple.com/search?term=" + Q(t); }],
    [/google play/i, function (t) { return "https://play.google.com/store/search?c=movies&q=" + Q(t); }],
    [/youtube/i, function (t) { return "https://www.youtube.com/results?search_query=" + Q(t); }],
    [/shahid/i, function (t) { return "https://shahid.mbc.net/ar/search?term=" + Q(t); }],
    [/osn/i, function (t) { return "https://osnplus.com/ar/search?q=" + Q(t); }],
    [/starz/i, function (t) { return "https://www.starzplay.com/ar/search?q=" + Q(t); }],
    [/crunchyroll/i, function (t) { return "https://www.crunchyroll.com/search?q=" + Q(t); }],
    [/mubi/i, function (t) { return "https://mubi.com/search/films?query=" + Q(t); }],
    [/hbo|^max$|max amazon/i, function (t) { return "https://play.max.com/search?q=" + Q(t); }],
    [/paramount/i, function (t) { return "https://www.paramountplus.com/search/?q=" + Q(t); }],
    [/hulu/i, function (t) { return "https://www.hulu.com/search?q=" + Q(t); }],
    [/viu/i, function (t) { return "https://www.viu.com/ott/search?keyword=" + Q(t); }],
    [/watch ?it/i, function (t) { return "https://www.watchit.com/#/search?q=" + Q(t); }],
    [/^tod\b/i, function (t) { return "https://www.tod.tv/ar/search?q=" + Q(t); }],
    [/weyyak/i, function (t) { return "https://weyyak.com/ar/search?q=" + Q(t); }],
    [/rakuten/i, function (t) { return "https://www.rakuten.tv/search?q=" + Q(t); }],
    [/tubi/i, function (t) { return "https://tubitv.com/search/" + Q(t); }],
    [/pluto/i, function (t) { return "https://pluto.tv/search/details?query=" + Q(t); }],
    [/kocowa/i, function (t) { return "https://www.kocowa.com/en_us/search?q=" + Q(t); }],
    [/iqiyi/i, function (t) { return "https://www.iq.com/search?query=" + Q(t); }],
    [/yango/i, function (t) { return "https://play.yango.com/search?text=" + Q(t); }]
  ];
  // الاسم الأنسب للبحث داخل المنصة: الأصلي إذا كان بحروف لاتينية أو عربية، وإلا العربي/الإنجليزي
  function name(orig, ar, en) {
    if (orig && /^[\x00-\x7FÀ-ɏ\s\p{P}]+$/u.test(orig)) return orig;
    if (orig && /[؀-ۿ]/.test(orig)) return orig;
    return en || ar || orig || "";
  }
  function url(p, title, fallback) {
    var n = p.provider_name || "";
    for (var i = 0; i < P.length; i++) if (P[i][0].test(n)) return P[i][1](title);
    return fallback || "https://www.google.com/search?q=" + Q(title + " " + n);
  }
  // زر منصة قابل للضغط
  function btn(p, title, fallback, img) {
    return '<a class="wbtn" href="' + url(p, title, fallback) + '" target="_blank" rel="noopener nofollow" title="شاهده على ' + p.provider_name.replace(/"/g, "") + '"><img alt="" src="' + img + 'w92' + p.logo_path + '"><span>' + p.provider_name.replace(/</g, "") + '</span><i>↗</i></a>';
  }
  window.QW = { url: url, btn: btn, name: name };
})();
