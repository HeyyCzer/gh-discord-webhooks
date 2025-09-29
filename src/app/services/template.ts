import fs from 'fs';
import Handlebars from 'handlebars';
import path from 'path';
import logger from '../utils/logger';

export class TemplateService {

	private templatesDir: string;
	private cache: Map<string, string>;

	constructor(templatesDir: string = '../../../templates/github-events') {
		this.templatesDir = path.join(import.meta.dir, templatesDir);
		this.cache = new Map();
		this.registerHelpers();
	}

	render(templateName: string, data: Record<string, any>) {
		const template = this.loadTemplate(templateName);
		const compiled = Handlebars.compile(template);
		const rendered = compiled(data);

		return this.parse(rendered);
	}

	loadTemplate(templateName: string): string {
		if (this.cache.has(templateName)) {
			return this.cache.get(templateName)!;
		}

		const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
		const content = fs.readFileSync(templatePath, 'utf8');

		this.cache.set(templateName, content);
		return content;
	}

	parse(rendered: string): Record<string, any> {
		const parts = rendered.split('---');

		if (parts.length < 3) {
			throw new Error('Template inválido: formato deve ser ---\\nmetadata\\n---\\ncontent');
		}

		parts.shift();

		const metadataStr = parts[0].trim();
		const content = parts.slice(1).join('---').trim();

		const metadata = this.parseMetadata(metadataStr);

		return {
			...metadata,
			description: content || metadata.description
		};
	}

	parseMetadata(metadataStr: string): Record<string, any> {
		const metadata: Record<string, any> = {};
		const lines = metadataStr.split('\n');

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;

			const colonIndex = trimmed.indexOf(':');
			if (colonIndex === -1) continue;

			const key = trimmed.substring(0, colonIndex).trim();
			let value = trimmed.substring(colonIndex + 1).trim();

			if ((value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))) {
				value = value.slice(1, -1);
			}

			if (value.startsWith('{') && value.endsWith('}')) {
				try {
					metadata[key] = JSON.parse(value);
					continue;
				} catch {
					metadata[key] = value;
				}
			}

			if (key === 'color' && value.startsWith('0x')) {
				metadata[key] = parseInt(value, 16);
			}
			else if (!isNaN(Number(value)) && value !== '') {
				metadata[key] = Number(value);
			}
			else if (value === 'true') {
				metadata[key] = true;
			}
			else if (value === 'false') {
				metadata[key] = false;
			}
			else {
				metadata[key] = value;
			}
		}

		return metadata;
	}

	registerHelpers() {
		Handlebars.registerHelper('slice', function (str, start, end) {
			if (!str) return '';
			return str.slice(start, end);
		});

		Handlebars.registerHelper('arraySlice', function (arr, start, end) {
			if (!Array.isArray(arr)) return [];
			return arr.slice(start, end);
		});

		Handlebars.registerHelper('truncate', function (str, length) {
			if (!str) return '';
			if (str.length <= length) return str;
			return str.substring(0, length - 3) + '...';
		});

		Handlebars.registerHelper('formatDate', function (date) {
			if (!date) return '';
			return new Date(date).toLocaleString('pt-BR');
		});

		Handlebars.registerHelper('eq', function (a, b) {
			return a === b;
		});

		Handlebars.registerHelper('minus', function (a, b) {
			return a - b;
		});

		Handlebars.registerHelper('gt', function (a, b) {
			return a > b;
		});
		Handlebars.registerHelper('gte', function (a, b) {
			return a >= b;
		});
		Handlebars.registerHelper('lt', function (a, b) {
			return a < b;
		});
		Handlebars.registerHelper('lte', function (a, b) {
			return a <= b;
		});

		Handlebars.registerHelper('plural', function (count, singular, plural) {
			return count === 1 ? singular : plural;
		});
	}

	clearCache() {
		this.cache.clear();
	}

	registerPartial(name: string, content: string) {
		Handlebars.registerPartial(name, content);
	}

	loadPartials(partialsDir = path.join(this.templatesDir, 'partials')) {
		if (!fs.existsSync(partialsDir)) return logger.warn(`Partials directory not found: ${partialsDir}`);

		const files = fs.readdirSync(partialsDir);

		for (const file of files) {
			if (!file.endsWith('.hbs')) continue;

			const name = file.replace('.hbs', '');
			const content = fs.readFileSync(path.join(partialsDir, file), 'utf8');
			this.registerPartial(name, content);
		}
	}
}
