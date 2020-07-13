// a module script to read and parse spr and act files

var spriteReader = {
    readFile: function (url) {
        let data = jsb.fileUtils.getDataFromFile(url);
        return {raw: data, view: new DataView(data.buffer), idx: 0};
    },

    readInt16: function (data, littleEndian = true) {
        let val = data.view.getInt16(data.idx, littleEndian);
        data.idx += 2;
        return val;
    },

    readFrameData: function (data, reserve, size) {
        let res = new Int32Array(reserve).fill(0);
        let prev = 1;
        for (let i = 0; i < size; ++i) {
            let b = data.raw[data.idx + i];
            if (prev == 0) {
                i += Math.max(0, b - 1);
            } else {
                res[i] = b;
            }
            prev = b;
        }
        data.idx += size;
        return res;
    },

    readPalette: function (data) {
        return new Int32Array(data.raw.slice(data.idx, data.idx + 4*256).buffer);
    },

    fillColor: function (data, palette) {
        for (let i = 0; i < data.length; ++i) {
            data[i] = palette[data[i]];
        }
    },

    parseData: function (data) {
        // result structure
        let res = {
            frames: [],
            palette: null,
        };
        // skip first four bytes
        data.idx += 4;
        let frameCounts = this.readInt16(data);
        // skip two bytes
        data.idx += 2;
        for (let i = 0; i < frameCounts; ++i) {
            let frame = {};
            frame.width = this.readInt16(data);
            frame.height = this.readInt16(data);
            frame.size = this.readInt16(data);
            frame.data = this.readFrameData(data, frame.width*frame.height, frame.size);
            // console.log(i + ": (" + frame.width + ", " + frame.height + ") - " + frame.size + ", " + frame.data.length);
            res.frames.push(frame);
        }
        res.palette = this.readPalette(data);
        for (let frame of res.frames) {
            this.fillColor(frame.data, res.palette);
        }
        // console.log(res.frames.length);
        return res;
    }
};

/* TODO, the result passing from parser to the load function seems not working!
cc.assetManager.downloader.register('.spr', (url, options, onComplete) => {
    cc.log('downloader called!!!');
    var reader = require("sprite_reader");
    var myData = reader.readFile(url);
    onComplete && onComplete(null, myData);
});
cc.assetManager.parser.register('.spr', function (file, options, onComplete) {
    cc.log('parser called!!!');
    var reader = require("sprite_reader");
    var res = reader.parseData(file);
    var tex = new cc.Texture2D;
    tex.initWithData(res.frames[0].data, cc.Texture2D.PixelFormat.RGBA8888, res.frames[0].width, res.frames[0].height);
    onComplete && onComplete(null, tex);
});
// var file_path = String.raw`E:\GameProjects\wx_td2\assets\resources\sprite\wolf.spr`;
// cc.assetManager.loadAny({path: 'resources/sprite/wolf.spr'}, (err, res) => {
cc.resources.load('sprite/wolf', (err, res) => {
    if (err) {
        cc.log(err);
    } else {
        cc.log("callback: " + err + ", " + tex);
    }
});
*/
module.exports = spriteReader;
