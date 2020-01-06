//
// function getXmlHttpObject(){
//     var xmlHttpRequest=new XMLHttpRequest();
//
//     if (xmlHttpRequest)
//         window.alert("xmlHttpRequest success");
//     return xmlHttpRequest;
// }

var renderer;
var canvas;
var scene;
var camera;
var geom;
var cubesSat;
var cubesPerm;
var cubesPres;
var box;
var material;
var pivot;
var dist;
var axes1;
var axes2;
var gui;
var crl;
var view;
var edges;
var light;
var Perm_Group_Count;
var arrowHelperI;
var arrowHelperJ;
var arrowHelperInj;
var arrowHelperPro;
var replay;
var injectText;
var ProTest;
var Controls= function(){
    this.X=0;
    this.Y=0;
    this.Z=0;

};

function initModel(){

    light = new THREE.HemisphereLight(0xffffff, 0xe0e0e0, 0.8);
    //light=new THREE.AmbientLight(0xffffff);

    axes1=new THREE.AxesHelper(600);
    axes2=new THREE.AxesHelper(600);

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    canvas= document.getElementById('modelcanvas');
    scene = new THREE.Scene();
    scene.background=new THREE.Color(0x86CBEC);
    //camera = new THREE.PerspectiveCamera(75, 678 / 500, 1, 10000);
    camera=new THREE.OrthographicCamera(-600,600,1200*500/678/2,-1200*500/678/2,0.1,10000);
    geom = new THREE.CubeGeometry(25, 25, 25);
    renderer.setSize(678, 500);
    cubesSat = new THREE.Object3D();
    edges=new THREE.Object3D();
    cubesPerm = new THREE.Object3D();
    cubesPres = new THREE.Object3D();
    canvas.appendChild(renderer.domElement);
    pivot = new THREE.Group();
    dist = 500 / ( 2 * Math.tan( camera.fov * Math.PI / 360 ) );
    //camera.position.set( 0, 0, 400 + dist );
    camera.position.set( 0, 0, 800 );
    // camera.lookAt(0,0,0);
    replay=new Map();
    buildModel();
}


function render() {

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}


//validate input
var validated=false;
function validateModel() {
    if(!validated){

        //assign permeablitiy values to cubes.
        cubesPerm.traverse( function ( child ) {
            if ( child.permGroup===0 && child instanceof THREE.Mesh) {
                child.perm =parseInt($("#fieldperm").val(),10);

            }
            console.log(child)

        });

        //assign pressure values to cubes
        cubesPres.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh) {
                child.pres =parseInt($("#fieldp").val(),10);
                console.log(child.pres);
            }
        });


        var illegal=false;
        $("#input").each(function () {
            if ($(this).find('input').val() == "" || !$.isNumeric($(this).find('input').val())) {

                illegal=true;
                alert("Input field is not complete or invalid !");

            }
        });
        if (!illegal){
            validated=true;
            alert("Input are valid!")
        }





    }

}
function reset(){
    if(!calculating){
        resetModel();
    }
    else {alert("Calculation in progress, terminate first.")}

}
function resetModel(){
    pause=false;
    validated=false;
    terminated=false;

    $("#heterogroups").empty();
    cubesSat.traverse( function ( child ) {
        if (  child instanceof THREE.Mesh) {
            child.material.color.setRGB(1,0.5,0);
            cube.sat=0;


        }
    });
    Perm_Group_Count=0;
    cubesPerm.traverse( function ( child ) {
        if (  child instanceof THREE.Mesh) {

            child.perm =0;
            child.permGroup=Perm_Group_Count;
            child.isSelected=false;
            console.log(child.perm);
            child.material.color.setRGB(0.8, 0.8, 0.8);
        }
    });
    cubesPres.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh) {

            child.pres =parseInt($("#fieldp").val(),10);
            console.log(child.pres);
            child.material.color.setRGB(0, 0.5, 1);


        }

    });
    $("#input").each(function () {
        $(this).find('input').val('');

    });
    alert("Model data has been reset");
}




function buildModel() {

    var count = 0;
    Perm_Group_Count=0;
    //delete heterogroups

    for (var j = 0; j < 23; j++) {
        for (var i = 0; i < 23; i++) {

            //create saturation cubes

            mat = new THREE.MeshLambertMaterial();
            mat.color.setRGB(1, 0.5, 0);
            cube = new THREE.Mesh(geom, mat);
            cube.position.set(i * 30, j *30, 0);
            cube.sat=0;
            cube.receiveShadow=true;
            cubesSat.add(cube);

            //create permeability cutes
            mat = new THREE.MeshLambertMaterial();
            mat.color.setRGB(0.8, 0.8, 0.8);
            cube = new THREE.Mesh(geom, mat);
            cube.position.set(i * 30, j *30, 0);
            cube.receiveShadow=true;
            cube.permGroup=Perm_Group_Count;
            cube.perm=0;
            cube.isSelected=false;

            cubesPerm.add(cube);

            //create pressure cutes
            mat = new THREE.MeshLambertMaterial();
            mat.color.setRGB(0, 0.5, 1);
            cube = new THREE.Mesh(geom, mat);
            cube.position.set(i * 30, j *30, 0);
            cube.pres=0;
            cube.receiveShadow=true;
            cubesPres.add(cube);





            count++
        }
    }

//Arrows
    var dir = new THREE.Vector3( 2, 0, 0 );
    dir.normalize();
    var length = 50;
    var hex = 0xffff00;
    var origin = new THREE.Vector3(-0.9,-0.85, 0 ).unproject( camera );
    arrowHelperI = new THREE.ArrowHelper( dir, origin, length, hex );
    dir=new THREE.Vector3(0,2,0);
    dir.normalize();
    arrowHelperJ=new THREE.ArrowHelper(dir,origin,length,hex);
    dir = new THREE.Vector3( 0, 0, -1 );
    dir.normalize();
    origin = new THREE.Vector3(0,0,100);
    length=80;
    hex=0x0000ff;
    arrowHelperInj = new THREE.ArrowHelper( dir, origin, length, hex,0.2*length, 0.1*length );
    dir = new THREE.Vector3( 0, 0, 1 );
    dir.normalize();
    origin = new THREE.Vector3(22*30,22*30,20);
    length=80;
    hex=0xff0000;
    arrowHelperPro = new THREE.ArrowHelper( dir, origin, length, hex,0.2*length, 0.1*length );

    //Text labels




    scene.add( arrowHelperI );
    scene.add( arrowHelperJ );

    cubesPres.position.set(-330,-330,0);
    cubesPerm.position.set(-330,-330,0);
    cubesSat.position.set(-330,-330,0);
    arrowHelperInj.position.set(-330,-330,100);
    arrowHelperPro.position.set(330,330,20);
    light.position.set(0, 400, 0);
    scene.add( light );
    pivot.add( cubesPerm );
    pivot.add(arrowHelperInj);
    pivot.add(arrowHelperPro);
    scene.add( pivot );
    scene.add( edges );
    view='Perm';
    $("#selectview").val('Permeability');
    //pivot.add(axes1);

    render();
}




// mouse drag and rotate
var isDragging = false;
var previousMousePosition = {
    x: 0,
    y: 0
};

var adding=false;
function addingHetero() {
    if (!calculating) {

    if (view === 'Perm') {
        adding = true;
        alert('Keep pressed on the model to select blocks')
    } else {
        window.alert("Please switch to 'Permeability' view");
    }
}else {alert("Calculation in progress, terminate first.")}
}

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var isRightDragging=false;
var intersects;

$(document).ready(function(){

    initModel()

    $(renderer.domElement).on("mousedown", function(e) {

        if (e.button==0) {isDragging = true; }

    }).on('mousemove', function(e) {

        if(adding && isDragging ){

            mouse.x = ( e.offsetX/678) * 2 - 1;
            mouse.y = - ( e.offsetY/500 ) * 2 + 1;
            raycaster.setFromCamera( mouse, camera );

            intersects= raycaster.intersectObjects( cubesPerm.children);
            console.log(intersects.length);
            if ( intersects.length > 0 ) {

                var edge = new THREE.EdgesGeometry( intersects[intersects.length-1].object.geometry);
                var line = new THREE.LineSegments( edge, new THREE.LineBasicMaterial( { color: 0xff0000 , fog:true} ) );
                intersects[intersects.length-1].object.add(line);
                intersects[intersects.length-1].object.isSelected=true;
                //intersects[intersects.length-1].object.material.color.setRGB(255,0,0);
            }

        }

        var deltaMove = {
            x: e.offsetX -previousMousePosition.x,
            y: e.offsetY -previousMousePosition.y
        };

        if(!adding && isDragging) {

            pivot.rotation.x+= 0.005*deltaMove.y*1;
            pivot.rotation.z+= 0.005*deltaMove.x*1;
            arrowHelperI.rotation.x+= 0.005*deltaMove.y*1;
            arrowHelperI.rotation.z+= 0.005*deltaMove.x*1;
            arrowHelperJ.rotation.x+= 0.005*deltaMove.y*1;
            arrowHelperJ.rotation.z+= 0.005*deltaMove.x*1;

        }
        previousMousePosition = {
            x: e.offsetX,
            y: e.offsetY
        };


    });

    $(renderer.domElement).on('mouseup', function(e) {

        if ( adding && intersects.length > 0 ){

            dialog.dialog( "open" ).parent().draggable({
                containment: '#modelcanvas'

            });
        }

        // remove edges, change the color
        isDragging = false;
        adding=false;

    });

});

var dialog = $( "#heterodial" ).dialog({
    autoOpen: false,
    height: 180,
    width: 300,
    modal: true,
    resizable:false,
    title:"Set permeability value",
    position: { my: "center", of: $("#modelcanvas")  },
    buttons: {
        "Set": function() {
            Perm_Group_Count++;
            addLi(Perm_Group_Count,$("#heteroperm").val());

            cubesPerm.traverse( function ( child ) {
                if ( child.isSelected && child instanceof THREE.Mesh) {
                    var permv=parseInt($("#heteroperm").val(),10);
                    child.perm =permv;
                    child.permGroup=Perm_Group_Count;
                    child.isSelected=false;
                    console.log(child.perm);
                    child.material.color.setRGB(permv/500,permv/500,permv/500);
                    removeEdges(child);

                }
            });

            $(this).dialog("close");

        },
        "Cancel": function() {

            cubesPerm.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh) {

                    child.isSelectred=false;
                    removeEdges(child);
                }
            });

            $(this).dialog("close");

        }
    },
    open:function(event, ui) { $(".ui-dialog-titlebar-close").hide(); }


});

function removeEdges(child){
    while (child.children.length)
    {
        child.remove(child.children[0]);
    }

}

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();


function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}






//ajax request for sending and receiving data
var myXmlHttpRequest;
var calculating=false;
var terminated=false;

function start(){
    if(validated){
    $("#selectview").val('Saturation').trigger("change");}

   terminated=false;
    if(!validated){alert("Input is not validated")}
    else if(calculating){alert("Calculation is already in progress")}
    else {startCal();}
}
function terminate(){
    terminated=true;
    validated=false;
    calculating=false;
    alert("Simulatioin is terminated");
}

var pause=false;
$("#pause").click(function() {
        if (!pause && !terminated) {
            $("#pause").html('Continue')
            alert("Simulation is paused");
            pause=true;

        }
        else {$("#pause").html('Pause')

            pause=false;
        }
    }
)

function pauseCal(){
    pause=true;
}
function continueCal(){
    pause=false;
}

var url;
var injectp;
var productionp;
var fieldperm;
var fieldp;
var v1;
var v2;
var perm;
var ends;
var steps=0;
var endt=0;
var webSocket ;

function startCal(){
    calculating=true;
    //new ajex request
    url="/SimulationServer";
    injectp=$("#injectp").val();
    productionp=$("#productionp").val();
    fieldperm=$("#fieldperm").val();
    fieldp=$("#fieldp").val();
    v1=$("#v1").val();
    v2=$("#v2").val();
    perm=new Array();
    if($("#ends").is(':checked')){ends=$("#endS").val();}
    else{ends=0.5;}
    if($("#endt").is(':checked')){endt=$("#endT").val()*60*1000;}
    else{endt=1*60*1000;}
    for(var j=0; j<23;j++){
        perm[j]=new Array();
        for(var i=0;i<23;i++){
            console.log(cubesPerm.children[i+j*23].perm)
            perm[j][i]=cubesPerm.children[i+j*23].perm;
        }
    }
    var data={};
    var starttime=new Date().getTime();
    data["injectp"]=injectp;
    data["productionp"]=productionp;
    data["fieldperm"]=fieldperm;
    data["fieldp"]=fieldp;
    data["v1"]=v1;
    data["v2"]=v2;
    data["perm"]=perm;
    data["ends"]=ends;

    var dataJson=JSON.stringify(data);
    console.log(data);

    //websocket
    
    webSocket= new WebSocket('wss://flow3dsim.herokuapp.com/SimulationProcess');

    webSocket.onopen = function(event) {
        onOpen(event);
    };
    webSocket.onmessage = function(event) {
        onMessage(event)
    };

    function onMessage(event) {
        //  var saturationRes=JSON.parse(event.data);
        //console.log(event.data);
        if(pause && !terminated){ starttime=new Date().getTime(); webSocket.send("paused");}


        if(event.data!=="paused"){
            res=JSON.parse(event.data);
            var everageS=updateS(res[0]);
            var everageP=updateP(res[1]);
            replay.set(steps,res);
            steps++;
            $("#outputconsole").append("Step: "+steps+"<br/>"+ "Everage injecting phase saturation: "+everageS+"<br/>"+"Everage pressure: "+everageP+"<br/>>"+"-----------<br/>");
            var odiv    = $('#output-div');
            var height = odiv[0].scrollHeight;
            odiv.scrollTop(height);
            console.log(replay);
        }
        var currenttime=new Date().getTime();


        if(currenttime-starttime<=endt && !terminated && !pause){
            webSocket.send("calculating");}
        if(currenttime-starttime>endt || event.data==="terminated"){
            terminate();

        }


    }

    function onOpen(event) {
        alert("Connected....");
        webSocket.send(dataJson);
    }

    // for (var j=0;j<23;j++){
    //
    //     for(var i=0;i<23;i++){
    //
    //
    //         if (cubes.children[i+j*23].perm!=fieldperm){
    //
    //             //hetero data array add this i, j coordinates)
    //
    //
    //         }
    //     }
    //
    //
    // }
    //
    //
    //
    //
    //
    // myXmlHttpRequest=new XMLHttpRequest();
    // myXmlHttpRequest.open("post",url,true);
    // myXmlHttpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    // myXmlHttpRequest.send(data);
    // myXmlHttpRequest.onreadystatechange=function(){
    //
    //     if (myXmlHttpRequest.readyState==4){
    //
    //         //window.alert(myXmlHttpRequest.responseText);
    //         saturationRes=JSON.parse(myXmlHttpRequest.responseText);
    //         window.alert(saturationRes);
    //         updateS();
    //
    //     }
    // };
}




function updateS(saturation) {
    var total=0;

    for (var j = 0; j < 23; j++) {
        for (var i = 0; i < 23; i++) {
            var rate=saturation[j][i];
            // console.log(rate);
            // console.log("----------");
            cubesSat.children[i + j * 23].material.color.setRGB(1-rate, 0.5*(1-rate),rate);
            total+=rate;
        }
    }
    return total/(23*23);
}

function updateP(pressures) {
    var total=0;
    for (var j = 0; j < 23; j++) {
        for (var i = 0; i < 23; i++) {

            var rate=(pressures[j][i]-productionp*Math.pow(10,6))/((injectp*Math.pow(10,6))-productionp*Math.pow(10,6));
            // console.log(rate);
            // console.log("----------");
            cubesPres.children[i + j * 23].material.color.setRGB(rate, 0.5*(1-rate),1-rate);
            total+=pressures[j][i];
        }
    }
    return total/(23*23);
}

function pauseCal(){}

function terminateCal(){}


$("#selectview").change(function(){

    if ($(this).val()==='Permeability'){
        if (view!=='Perm'){

            if(view==='Sat'){pivot.remove(cubesSat);}
            else if(view==='Pres'){pivot.remove(cubesPres);}
            pivot.add(cubesPerm);
            view='Perm';
        }
        console.log(pivot.children);

    } else if ($(this).val()==='Saturation'){
        if (view!=='Sat'){

            if(view==='Perm'){pivot.remove(cubesPerm);}
            else if(view==='Pres'){pivot.remove(cubesPres);}
            pivot.add(cubesSat);
            view='Sat';
        }
        console.log(pivot.children);

    } else if($(this).val()==='Pressure'){
        if (view!=='Pres'){

            if(view==='Perm'){pivot.remove(cubesPerm);}
            else if(view==='Sat'){pivot.remove(cubesSat);}
            pivot.add(cubesPres);
            view='Pres';
        }
        console.log(pivot.children);
        // cubesPerm.traverse( function ( object ) { object.visible = false; } );
    }


});

function addLi(permGroup,permValue){
    var li_1=document.createElement("li");
    var cspan=document.createElement("span");
    li_1.setAttribute("class","newLi");
    li_1.setAttribute("value",permGroup);

    addSpan(li_1, permGroup);
    cspan.innerHTML="[_]";
    var rgbRate=Math.round(255*permValue/500);
    cspan.style.backgroundColor='rgb(' + rgbRate + ',' +  rgbRate+ ',' + rgbRate + ')';
    cspan.style.color='rgb(' + rgbRate + ',' +  rgbRate+ ',' + rgbRate + ')';
    li_1.appendChild(cspan);

    addSpan(li_1,permValue);
    addDelBtn(li_1);
    $("#heterogroups").append(li_1);
    console.log(li_1.getAttribute("value"));
}
function addSpan(li,text){
    var span_1=document.createElement("span");
    span_1.innerHTML=text;
    li.appendChild(span_1);
}

function addDelBtn(li){
    var span_1=document.createElement("span");
    var btn=document.createElement("button");
    btn.setAttribute("type","button");
    btn.setAttribute("class","delBtn");
    btn.setAttribute("onclick","delBtnData(this)");
    btn.innerHTML="Remove";
    span_1.appendChild(btn);
    li.appendChild(span_1);
}
function delBtnData(obj){
    var ul=document.getElementById("heterogroups");
    var oLi=obj.parentNode.parentNode;
    //obj.parentNodd span
    //obj.parentNode.parentNode
    cubesPerm.traverse( function ( child ) {
        if (child instanceof THREE.Mesh && child.permGroup==obj.parentNode.parentNode.getAttribute("value")) {

            child.perm=0;
            child.permGroup=0;
            child.material.color.setRGB(0.8,0.8,0.8);
            console.log("perm is reset");

        }
    });
    ul.removeChild(oLi);

}
function popsample(){
	$('#injectp').val(40)
	$('#productionp').val(15)
	$('#fieldp').val(25)
	$('#fieldperm').val(200)
	$('#v1').val(0.3)
	$('#v2').val(0.8)
}



