var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
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
}
catch (error) {
    console.error('Error creating Supabase client:', error.message);
    process.exit(1);
}
// Webhook endpoint
app.post('/webhook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return res.status(401).send('Unauthorized');
        }
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
        // Extract data
        const { firstname, lastname, cpf } = req.body;
        // Save data in Supabase
        const { data, error } = yield supabase
            .from('users')
            .insert([{ firstname, lastname, cpf }]);
        if (error)
            throw error;
        // Redirect the user to your landing page
        res.redirect(`https://www.useteko.com/thankyou?firstname=${firstname}&lastname=${lastname}&cpf=${cpf}`);
    }
    catch (err) {
        res.status(500).send('Error processing webhook');
    }
}));
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
