import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({
  path: path.resolve(process.cwd(), "../../../../.env"),
});

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);