/**
 * @alias bullMask Implement Mask
 * @author Felipe Pupo Rodrigues
 * @classDescription classe para aplicar mascaras em elementos de formulario
 */
var bullMask = new Class({
	Implements: Options,
	options:{
		placeholder:'_', //caracterer substituto
		charMap:{
			'9':"[0-9]",		//mascara de numero
			'a':"[A-Za-z]",		//mascara de letra
			'*':"[A-Za-z0-9]"	//mascara de caracteres comuns
		}
	},
	initialize: function(options){
		this.setOptions(options);
	},
	
	/**
	 * seta a mascara X para um determinado elemento
	 */
	setMask: function(element,mask,placeholder){
		if($type(element) == 'array'){
			element.each(function(e){
				this.setMask(e,mask,placeholder);
			});
		}
		
		var type 		= element.getProperty('type');
		var placeholder = (placeholder)?placeholder:this.options.placeholder;
		
		if(type == 'radio' || type == 'checkbox' || !mask)
			return false;

		element.store('mask',mask);
		element.store('placeholder',placeholder);
					
		element.addEvents({
			'keydown': this.applyMask.bindWithEvent(this)
		});
	},
	
	/**
	 * aplica a mascara no elemento, funcao chamada apenas por eventos
	 */
	applyMask:function(e){
		var eEvent		= new Event(e);
		var code		= eEvent.code;
		var element		= eEvent.target;
		var key			= eEvent.key;
		var ctl			= this.getCaretPosition(eEvent);
		var mask 		= element.retrieve('mask');
		var placeholder = element.retrieve('placeholder');
		
		//key validas
		if( !(code < 16 || (code > 16 && code < 32 ) || (code > 32 && code < 41)) ){
			for(var x = ctl.end; x >= ctl.begin ; x--){
				if(!this.writeText(element,eEvent,x,ctl.begin))
					return false;
			}
			e.stop();
			
		//key especial (backspace e delete)
		}else if(code==8 || code==46){
			for(var x = ctl.end; x >= ctl.begin ; x--){
				var charMap = this.options.charMap[mask.charAt(x-1)];
				var key = placeholder;
				if(!charMap)
					key = mask.charAt(x-1);
				if(element)
					element.value = this.replaceOneChar(element.value,key,x);
			}
			this.setCaretPosition(e,ctl.begin-1);
			e.stop();
		}
	},
	
	/**
	 * verifica caracterer e escreve a saida no elemento em sua posicao correta
	 */
	writeText: function(element,e,now,end,r){
		var mask 		= element.retrieve('mask');
		var placeholder = element.retrieve('placeholder');
		var charMap		= this.options.charMap[mask.charAt(now)];
		
		if(mask.length <= end)
			return false;
		
		if(charMap){
			var expression	= new RegExp(charMap);
			var verify		= 	e.key.test(expression);
			
			if(verify && now == end)
			{
				element.value = this.replaceOneChar(element.value,e.key,now+1);
				this.setCaretPosition(e,end+1);
				
				return true;
			}
			else if(!charMap)
				return false;
				
		}else{
			element.value = this.replaceOneChar(element.value,mask.charAt(now),now+1);
			
			if(now == end){
				this.writeText(element,e,now+1,now+1,true);
				this.setCaretPosition(e,now+2);
			}else
				this.setCaretPosition(e,end+1);

			return true;
		}
		element.value = this.replaceOneChar(element.value,placeholder,now+1);
		this.setCaretPosition(e,end+1);
		return true;
	},
	
	/**
	 * retorna o status da mascara, metodo não é usado internamente
	 */
	getMaskStatus: function(el){
		var mask = el.retrieve('mask');
		if(!mask) return false;
		var locked = [], buffer = [], reset = [];
		for(var i=0;i<mask.length;i++){
			locked[i]=this.options.charMap[mask.charAt(i)]==null;
			buffer[i]=locked[i]?mask.charAt(i):el.retrieve('placeholder');
			reset[i]=!locked[i]?(el.value.charAt(i)!=el.retrieve('placeholder')?el.value.charAt(i):''):'';
		};
		return {locked:locked,buffer:buffer,reset:reset};
	},
	
	/**
	 * retorna a posicao da selecao
	 */
	getCaretPosition: function(ctl){
		ctl = ctl.target;
		var res = {begin: 0, end: 0 };
		if (ctl.setSelectionRange){
			res.begin = ctl.selectionStart;
			res.end = ctl.selectionEnd;
		}else if (document.selection && document.selection.createRange){
			var range = document.selection.createRange();			
			res.begin = 0 - range.duplicate().moveStart('character', -100000);
			res.end = res.begin + range.text.length;
		}
		return res;
	},
	
	/**
	 * seta a posicao de selecao
	 */
	setCaretPosition: function(ctl, pos){
		ctl = ctl.target;
		if(ctl.setSelectionRange){
			ctl.focus();
			ctl.setSelectionRange(pos,pos);
		}else if (ctl.createTextRange){
			var range = ctl.createTextRange();
			range.collapse(true);
			range.moveEnd('character', pos);
			range.moveStart('character', pos);
			range.select();
		}
	},
	
	/**
	 * modifica um caracterer por posicao
	 */
	replaceOneChar: function(s,c,n){
		(s = s.split(''))[--n] = c;
		return s.join('');
	}
})