const Messenger = {
    lang: "zh-cn",

    load: function (url) {
        // do not repeatedly load the same resource
        if (this.url && this.url == url) { return; }
        cc.resources.load(url, cc.JsonAsset, (err, asset) => {
            this.data = asset.json;
            this.setLanguage(this.lang);
            this.url = url;
        })
    },

    setLanguage: function (lang) {
        if (this.data && this.data.hasOwnProperty(lang)) {
            this.mes = this.data[lang];
        } else {
            console.log("cannot find language data: " + lang)   ;
        }
    },

    get: function (key) {
        if (!this.mes) { return ""; }
        return this.mes[key];
    }

};

export default Messenger;
// module.exports = Messenger;
