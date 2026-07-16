import dotenv from 'dotenv';
dotenv.config();
fetch(`${process.env.SUPABASE_URL}/rest/v1/?apikey=${process.env.SUPABASE_SERVICE_ROLE_KEY}`).then(res => res.json()).then(json => {
  const usersDef = json.definitions.users;
  console.log(usersDef ? Object.keys(usersDef.properties) : 'No users definition');
});
