// a module script to read and parse spr and act files

var spriteReader = {
    readFile: function (url) {
        var data = jsb.fileUtils.getDataFromFile(url);
        return {raw: data, view: new DataView(data.buffer), idx: 4};
    },

    readInt16: function (data, littleEndian = true) {
        var val = data.view.getInt16(data.idx, littleEndian);
        data.idx += 2;
        return val;
    },

    readArray: function (data, size) {
        var val = data.raw.slice(data.idx, data.idx + size);
        data.idx += size;
        return val;
    },

    parseData: function (data) {
        data.idx = 4;
        var frameCounts = this.readInt16(data);
        console.log(frameCounts);
        data.idx = 8;
        for (var i = 0; i < frameCounts; ++i) {
            var width = this.readInt16(data);
            var height = this.readInt16(data);
            var size = this.readInt16(data);
            var frameData = this.readArray(data, size);
            // console.log(i + ": (" + width + ", " + height + ") - " + size);
        }
        var palette = new Int32Array(data.raw.slice(data.idx, data.idx + 4*256).buffer);
    }
};

module.exports = spriteReader;