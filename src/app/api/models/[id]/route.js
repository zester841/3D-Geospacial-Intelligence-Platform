import dbConnect from '../../../../../lib/dbConnect';
import {Model} from '../../../../../lib/models'
import fs from 'fs';
import path from 'path';

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        // console.log(params);
        const modelId = params.id;
        // console.log(modelId);

        const model = await Model.findById(modelId);
        // console.log("model", model)

        if (!model) {
            return new Response(JSON.stringify({ error: 'Model not found' }), { status: 404 });
        }

        // Delete model file from /public/uploads if you are storing locally
        const modelPath = path.join(process.cwd(), 'public', 'models', model.filename);
        if (fs.existsSync(modelPath)) {
            fs.unlinkSync(modelPath);
        }

        // Remove from DB
        await Model.findByIdAndDelete(modelId);

        return new Response(JSON.stringify({ message: 'Model deleted successfully' }), { status: 200 });
    } catch (error) {
        console.error('DELETE model error:', error);
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    }
}
