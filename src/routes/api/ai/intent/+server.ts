import { GoogleGenerativeAI } from '@google/generative-ai';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || '');

export const POST: RequestHandler = async ({ request }) => {
	const { query, context } = await request.json();

	if (!query) throw error(400, 'Query is required');

	try {
		const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

		const systemPrompt = `
      You are Georava AI, a geospatial expert assistant.
      Your goal is to parse user intent into spatial commands.
      
      Available actions:
      - fly_to(location): Move map to a specific location
      - buffer(distance_in_meters): Create buffer around features
      - simplify(tolerance): Simplify geometries
      - union(): Merge overlapping features
      - switch_basemap(id): Change basemap (osm, satellite, topo, dark)
      - unknown: If command is not understood
      
      Current Map Context (GeoJSON summary):
      ${context || 'No features on map'}
      
      Respond ONLY with a JSON object:
      {
        "action": "action_name",
        "params": { ... },
        "narrative": "Friendly explanation of what you are doing"
      }
    `;

		const result = await model.generateContent([systemPrompt, query]);
		const response = await result.response;
		const text = response.text();

		// Clean JSON from potential markdown wrappers
		const cleanJson = text.replace(/```json|```/g, '').trim();
		return json(JSON.parse(cleanJson));
	} catch (e) {
		console.error('AI Error:', e);
		return json({ action: 'unknown', narrative: 'I encountered an error processing that.' });
	}
};
