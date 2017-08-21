navigator.getUserMedia=(navigator.mozGetUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia);
RTCPeerConnection=(mozRTCPeerConnection || RTCPeerConnection || webkitRTCPeerConnection || msRTCPeerConnection);
RTCSessionDescription=(mozRTCSessionDescription || RTCSessionDescription || webkitRTCSessionDescription || msRTCSessionDescription);
RTCIceCandidate=(mozRTCIceCandidate || RTCIceCandidate || webkitRTCIceCandidate ||msRTCIceCandidate);


function getMedia(stat){
	mystatus=stat;
	navigator.getUserMedia({audio:true,video:true},function(stream){
    local.src=window.URL.createObjectURL(stream);
    localStream=stream;
    local.play();
	},function(err){alert("Media error:"+err);});
	if(stat){
	p2p=new RTCPeerConnection({"iceservers":[{'url':'stun:stun.services.mozilla.com'}]});
	alert("Host Ready");
	p2p.onicecandidate=function(event){if(!p2p || !event || !event.candidate) return;
        ws.send(JSON.stringify({'offercandidate':JSON.stringify(event.candidate)}));
	};
	p2p.onaddstream=function(event){alert("Remote Stream Added");
	if(!p2p || !event || !event.stream) return;
    remote.src=URL.createObjectURL(event.stream);
    remote.play();
};
	p2p.addStream(localStream);
	p2p.createOffer(success,failure,{'mandatory':{'OfferToReceiveVideo':true,'OfferToReceiveAudio':true}});
	function success(session){
		p2p.setLocalDescription(session,function(){
			if(ws && session.sdp){
              ws.send(JSON.stringify({'offersession':JSON.stringify(session)}));
              alert("Offer Sent");
          }
		},function(e){alert("LD Error");});
	}
	function failure(e){
		alert("Offer Failed");
	}
  } 
  else if(!stat){

  	p2p=new RTCPeerConnection({"iceservers":[{'url':'stun:stun.services.mozilla.com'}]});
	alert("Clinet Ready");
	p2p.onicecandidate=function(event){if(!p2p || !event || !event.candidate) return;
        ws.send(JSON.stringify({'answercandidate':JSON.stringify(event.candidate)}));
	};
	p2p.onaddstream=function(event){alert("Remote Stream Added");
	if(!p2p || !event || !event.stream) return;
    remote.src=URL.createObjectURL(event.stream);
    remote.play();
};
	p2p.addStream(localStream);

  }
}

function answer(){
      p2p.createAnswer(success,failure,{'mandatory':{'OfferToReceiveVideo':true,'OfferToReceiveAudio':true}});
        function success(sdpp){
    	p2p.setLocalDescription(sdpp,function(){
    		if(sdpp.sdp){
    			ws.send(JSON.stringify({'answersession':JSON.stringify(sdpp)}));
              alert("Answer Sent");
    		}
    	},function(err){alert("SDP:"+err);});
    }
    function failure(err){
    	alert("Offer:"+err);
    }
}

function setAnsRemote(session){
    p2p.setRemoteDescription(new RTCSessionDescription(session),function(s){},
    	function(e){alert("Remote Answer Description Error"+e);});
    answer();
    
}

function setOffRemote(session){
    p2p.setRemoteDescription(new RTCSessionDescription(session),function(ses){},
    	function(e){alert("Remote Question Description Error");});
}
function setIce(ice){
	ics=JSON.parse(ice);
	p2p.addIceCandidate(new RTCIceCandidate(ics),function(e){},
		function(e){alert("Ice Error:"+e);});
}
function signal(){
ws=new WebSocket("ws://192.168.43.90:8888");
ws.onopen=function(e){state.innerHTML="Online";state.style.color="green";};
ws.onclose=function(e){state.innerHTML="Offline";state.style.color="red";};
ws.onerror=function(e){};
ws.onmessage=function(e){
dat=JSON.parse(e.data);
if(!mystatus){
offerses=dat.offersession;
if(offerses){
	var os=JSON.parse(offerses);
	if(os.type="offer")
	setAnsRemote(os);
}
offercand=dat.offercandidate;
if(offercand){
setIce(offercand);
}
}
else if(mystatus){
answerses=dat.answersession;
if(answerses){
	var os=JSON.parse(answerses);
	if(os.type="answer")
	setOffRemote(os);
}
answercand=dat.answercandidate;
if(answercand){
setIce(answercand);
}
}
};
}