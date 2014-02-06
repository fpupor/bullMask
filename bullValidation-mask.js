/**
 * @alias bullValidation with bullMask
 * @author Felipe Pupo Rodrigues
 * @classDescription implementação de mascara com validacao de formulario
 */
bullValidation.implement({
	options:{
		checkRulesInBlur: true,	//ativa verificacao por perda de focus
		activeMask: true,		//ativa mascara
		mask:{},				//configuracao de mascaras para elmentos e(ou) grupos
		charMap:{},				//mapa de caracteres especiais
		placeholder:'_'			//caracterer substituto
	},
	
	/**
	 * inicializa um novo validador adicionando e modificando metodos originais do bullValidation
	 */
	initialize: function(options){
		this.parent(options);
		this.parentGetFieldValue = this.getFieldValue;
		this.getFieldValue = this._getFieldValue;
		
		if(!bullMask)
			alert('é necessario adicionar a classe bullMask');
		
		this.bullMask = new bullMask({
			charMap:this.options.charMap,
			placeholder:this.options.placeholder
		});
		
		for (elementName in this.options.rules)
		{
			var formElements = this.getFormElement(elementName);
							
			$$(formElements).each(function(el){
				var type = el.getProperty('type');
				
				if(type != 'radio' && type != 'checkbox'){
					if(this.options.checkRulesInBlur){
						el.addEvent('blur', this.checkRuleBlur.bind(this,elementName));
					}
					if(this.options.activeMask && bullMask && this.options.mask[elementName]){
						if($type(this.options.mask[elementName]) == 'array')
						{
							var mask = this.options.mask[elementName][0];
							var placeholder = this.options.mask[elementName][1];
						}
						else
						{
							var mask = this.options.mask[elementName];
							var placeholder = false;
						}
						this.bullMask.setMask(el,mask,placeholder);
					}
				}else if(this.options.checkRulesInBlur){
					el.addEvent('click', this.checkRuleBlur.bind(this,elementName));
				}
				
			},this);
		}
	
	},
	
	/**
	 * forca o check e atualiza os erros
	 */
	checkRuleBlur: function(elementName){
		this.checkRules(elementName);
		this.updateError(elementName);
	},
	
	/**
	 * pega o valor original do elemento, sem mascara
	 */
	_getFieldValue:function(el){
		if(el.retrieve('mask')){
			var value = this.bullMask.getMaskStatus(el).reset.join('');
			if(value && value != '')
				return this.parentGetFieldValue(el);
			return null;
		}
		return this.parentGetFieldValue(el);
	}
})