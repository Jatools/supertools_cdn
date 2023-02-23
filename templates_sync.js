
export const tSync = {
	export: (moduleName) => {
		let templates = tSync.collectTemplates(moduleName);
		let styles = tSync.collectStyles(moduleName);
		let sync;
		if ( Meteor.isProduction ) sync = DDP.connect("https://sync.supertools.janado.de");
		if ( Meteor.isDevelopment ) sync = DDP.connect("http://localhost:3030");

		sync.call("syncTemplates", moduleName, templates, styles, (error, result) => {
			let response = error ? error : result;
			console.log(response);
		});
	},
	exportTemplate: (name, moduleName) => {
		let renderFunction = Template[name].renderFunction;
		let template = {
			module: moduleName,
			name: name,
			viewName: Template[name].viewName,
			renderFunction: `(${renderFunction.toString()})`,
			helpers: null,
			events: null,
			onCreated: null,
			onRendered: null
		};

		if ( tools[`${name}__helpers`] ) template.helpers = tSync.obj2str(tools[`${name}__helpers`]);
		if ( tools[`${name}__events`] ) template.events = tSync.obj2str(tools[`${name}__events`]);
		if ( tools[`${name}__created`] ) template.onCreated = tools[`${name}__created`].toString();
		if ( tools[`${name}__rendered`] ) template.onRendered = tools[`${name}__rendered`].toString();

		let styles = tSync.collectStyles(name);

		let sync;
		if ( Meteor.isProduction ) sync = DDP.connect("https://sync.supertools.janado.de");
		if ( Meteor.isDevelopment ) sync = DDP.connect("http://localhost:3030");

		sync.call("syncTemplates", moduleName, [template], styles, (error, result) => {
			let response = error ? error : result;
			console.log(response);
		});
	},
	collectTemplates: (moduleName) => {
		let templates = [];

		templateNames.map(name => {
			let renderFunction = Template[name].renderFunction;
			let template = {
				module: moduleName,
				name: name,
				viewName: Template[name].viewName,
				renderFunction: `(${renderFunction.toString()})`,
				helpers: null,
				events: null,
				onCreated: null,
				onRendered: null
			};

			if ( tools[`${name}__helpers`] ) template.helpers = tSync.obj2str(tools[`${name}__helpers`]);
			if ( tools[`${name}__events`] ) template.events = tSync.obj2str(tools[`${name}__events`]);
			if ( tools[`${name}__created`] ) template.onCreated = tools[`${name}__created`].toString();
			if ( tools[`${name}__rendered`] ) template.onRendered = tools[`${name}__rendered`].toString();

			templates.push(template);
		});

		return templates;
	},
	collectStyles: (moduleName) => {
		let styles = [];
		let styleSheets = document.styleSheets;

		for ( sheet of styleSheets ) {
			if ( sheet.href ) continue;
			for ( style of sheet.cssRules ) {
				if ( !style.selectorText ) continue;
				if ( !style.selectorText.includes(`.${moduleName}`) ) continue;
				styles.push(style.cssText);
			}
		}

		return { module: moduleName, styles: styles };
	},
	extractTemplates: (templates) => {
		for ( template of templates ) {
			let renderFunction = template.renderFunction;
			Blaze.Template[template.name] = new Template(`Template.${template.name}`, eval(renderFunction) );
			// if ( template.helpers ) console.log(JSON.parse(template.helpers))
			if ( template.helpers ) Blaze.Template[template.name].helpers( tSync.str2obj(template.helpers) );
			// console.log( str2obj(template.events) );
			if ( template.events ) Blaze.Template[template.name].events( tSync.str2obj(template.events) );
			// if ( template.events ) console.log( str2obj(template.events) );
			if ( template.onCreated ) Blaze.Template[template.name]._callbacks.created[0] = new Function("return" + template.onCreated)();
			if ( template.onRendered ) Blaze.Template[template.name]._callbacks.rendered[0] = new Function("return" + template.onRendered)();
		}
	},
	extractStyles: (stylesData) => {
		let styles = stylesData.styles.join("\n");
		$(`.${stylesData.module}-styles`).remove();
		$("body").append(`<style class='${stylesData.module}-styles'>${styles}</style>`);
	},
	hasProp: (el, prop) => {
		for ( key in el ) {
			if ( key === prop ) return true;
		}
		return false;
	},
	obj2str: (obj) => {
		let res = {};
		for ( key in obj ) {
			res[key] = obj[key].toString();
		}
		return JSON.stringify(res);
	},
	str2obj: (str) => {
		let res = {};
		let obj = JSON.parse(str);
		for ( key in obj ) {
			let strf = obj[key];
			let func = eval(strf);
			res[key] = func;
		}
		return res;
	}
};
