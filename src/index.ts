import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in the environment variables.');
    process.exit(1);
}

let supabase;
try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
    console.error('Error creating Supabase client:', (error as Error).message);
    process.exit(1);
}

// Webhook endpoint
app.post('/webhook', async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send('Unauthorized');
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '');

        // Extract data
        const { firstname, lastname, cpf } = req.body;

        // Save data in Supabase
        const { data, error } = await supabase
            .from('users')
            .insert([{ firstname, lastname, cpf }]);

        if (error) throw error;

        // Redirect the user to your landing page
        res.redirect(`https://www.useteko.com/thankyou?firstname=${firstname}&lastname=${lastname}&cpf=${cpf}`);
    } catch (err) {
        res.status(500).send('Error processing webhook');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
