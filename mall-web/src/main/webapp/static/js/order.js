layui.define(['form','layer','table','laytpl','jl'],function(exports){
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laytpl = layui.laytpl,
        table = layui.table
        jl = layui.jl;

    //订单列表
    var tableIns = table.render({
        elem: '#userList',
        url : '/user/getOrder',
        cellMinWidth : 95,
        page : true,
        height : "full-400",
        limits : [10,15,20,25],
        limit : 20,
        id : "userListTable",
        cols : [[
            {type: "checkbox", fixed:"left", width:50},
            {field: 'serial', title: '订单编号', minWidth:100, align:"center"},
            {field: 'number', title: '订购数量', minWidth:50, align:'center'},
            {field: 'money', title: '订单金额', minWidth:50, align:'center'},
            {field: 'status', title: '订单状态', minWidth:50, align:'center',templet:function(d){
                var s = d.status;
                if (s == 1){
                    return "待付款";
                } else if (s == 2){
                    return "待发货";
                } else if (s == 3){
                    return "已发货";
                } else if (s == 4){
                    return "交易成功";
                }
                }},
            {field: 'address', title: '收货信息', minWidth:100, align:'center',templet:function (d) {
                    return "<p> 收货人：" + d.address.name +"</p><p>电话："+ d.address.phone +"</p><p>邮编："
                        + d.address.postcode +"</p><p>地址："+ d.address.place +"</p>";
                }},
            {field: 'orderItem', title: '订单详情', align:'center',templet:function(d){
                var it = d.orderItem;
                var res = "";
               $.each(it, function (index, oi) {
                   res += "<p><img height='100px;' src='"+oi.product.imgs +"'></p><p>产品：" + oi.product.name + "&nbsp;&nbsp;单价："+ oi.product.price +"</p><p>购买数量："
                       + oi.number +"&nbsp;&nbsp;小计：" + oi.money +"</p><hr>";
               });
              return res;
            }},
            {field: 'created', title: '下单时间', align:'center',minWidth:150,sort:true},
            {field: 'status', title: '操作', minWidth:175,fixed:"right",align:"center", templet:function (d) {
                    var s = d.status;
                    if (s == 1){
                        return "<a href='/user/pay/"+ d.id +"' class='layui-btn layui-btn-xs' lay-event='pay'>去付款</a><a class='layui-btn layui-btn-xs layui-btn-danger' lay-event='del'>删除</a>";
                    } else if (s == 2){
                        return "付款成功，等待店家发货";
                    } else if (s == 3){
                        return "<a class='layui-btn layui-btn-xs' lay-event='sure'>确认收货</a>";
                    } else if (s == 4){
                        return "<a class='layui-btn layui-btn-xs layui-btn-danger' lay-event='del'>删除</a>";
                    }
                }}
        ]]
    });

    //搜索【此功能需要后台配合，所以暂时没有动态效果演示】
    $(".search_btn").on("click",function(){
        if($(".searchVal").val() != ''){
            table.reload("newsListTable",{
                page: {
                    curr: 1 //重新从第 1 页开始
                },
                where: {
                    key: $(".searchVal").val()  //搜索的关键字
                }
            })
        }else{
            layer.msg("请输入搜索的内容");
        }
    });

    //批量删除
    $(".delAll_btn").click(function(){
        var checkStatus = table.checkStatus('userListTable'),
            data = checkStatus.data,
            newsId = '';
        if(data.length > 0) {
            for (var i in data) {
                newsId += (data[i].id) + '-';
            }
            layer.confirm('确定删除选中的订单？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    url : "/a/order",
                    data: newsId,
                    type: "DELETE",
                    dataType: 'json',
                    contentType: 'application/json;charset=UTF-8',
                   success : function (res) {
                       layer.msg(res.msg);
                       if (res.code === 200 ){
                           tableIns.reload();
                       }
                   }
                });
                layer.close(index);
                return false;
            })
        }else{
            layer.msg("请选择需要删除的订单");
        }
    });


    //列表操作
    table.on('tool(userList)', function(obj){
        var layEvent = obj.event,
            data = obj.data;
        /*if(layEvent === 'pay'){ //付款
            pay(data);
        }else */if(layEvent === 'sure'){ //收货
            layer.confirm('确认您已经收到了货？',{icon:3, title:'提示信息'},function(index){
                jl.req('/user/sureOrder',{id:data.id},function (res) {
                    layer.msg(res.msg);
                    if (res.code === 200 ){
                        tableIns.reload();
                    }
                });
                layer.close(index);
                return false;
            });
        }else if(layEvent === 'del'){ //删除
            layer.confirm('确定删除'+ data.serial +'订单？',{icon:3, title:'提示信息'},function(index){
                $.ajax({
                    url : "/a/order",
                    data: data.id,
                    type: "DELETE",
                    dataType: 'json',
                    contentType: 'application/json;charset=UTF-8',
                    success : function (res) {
                        layer.msg(res.msg);
                        if (res.code === 200 ){
                            tableIns.reload();
                        }
                    }
                });
                layer.close(index);
                return false;
            });
        }
    });

   /* function pay(data){
        jl.req('/user/pay',{
            id : data.id,
            number : data.number,
            money : data.money,
            status : data.status
        },function (res) {
            layer.msg(res.msg);
        })
    }*/
    exports('order',null);
});
