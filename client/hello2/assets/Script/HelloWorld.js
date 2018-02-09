cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        btnstart: {
            default: null,
            type: cc.Button
        },
        // defaults, set visually when attaching this script to the Canvas
        text: '11111'
    },

    // use this for initialization
    onLoad: function () {
        this.label.string = this.text;

        this.btnstart.node.on('click', this.OnStartBtn, this);

        this.miSocket = io.connect("127.0.0.1:4747");
        this.miSocket.on('hello', (msg) => {
            console.log("hello...");
            this.label.string = msg;
        })

        this.miSocket.on('receiveMessage', (event) => {  
            console.log('收到 receiveMessage');
            console.log(event);

            var tType = typeof(event.data);
            console.log('收到 receiveMessage tType='+tType);

            var receiveData;
            if (event.data instanceof ArrayBuffer)
            {
                console.log('收到 receiveMessage  111111');
                //如果后端发送的是二进制帧（protobuf）会收到前面定义的类型
                receiveData = proto.messagebody.deserializeBinary(event.data);
            }else{
                console.log('收到 receiveMessage  000000');
                //后端返回的是文本帧时触发
                receiveData = event.data;

                // 将object里的值收集到一个数组tDataArray，再将tDataArray反序列化
                var tDataArray = new Array();
                for(var key in receiveData)
                {
                    tDataArray.push(receiveData[key]);
                }
                receiveData = proto.messagebody.deserializeBinary(tDataArray);

                var tFactory = receiveData.getFactory();
                var tDeviceid = receiveData.getDeviceid();
                var tGetLength = receiveData.getLength();
                var tType = receiveData.getType();
                var tBody = receiveData.getBody();
                console.log("tFactory = "+tFactory);
                console.log("tDeviceid = "+tDeviceid);
                console.log("tGetLength = "+tGetLength);
                console.log("tType = "+tType);
                console.log("tBody = "+tBody);
            }
            console.log("receiveData = "+receiveData);
        })  
    },

    // called every frame
    update: function (dt) {

    },

    OnStartBtn: function(event){
        console.log("OnStartBtn...");

        // var msg_pb = require('msg_pb.test');
        // var tMsgPacket = new msg_pb.msg();
        // tMsgPacket.setId(101);

        var content = new proto.messagebody();
        content.setFactory("3G");//厂商
        content.setDeviceid("123456");//设备id
        content.setLength("0009");//长度
        content.setType("type");//类型
        content.setBody("0,150,56");//内容


         
        console.log("content="+content); 
        var bytes = content.serializeBinary();
        console.log("bytes="+bytes); 

        this.miSocket.emit('sendMessage', { data: bytes });  
    }
});
