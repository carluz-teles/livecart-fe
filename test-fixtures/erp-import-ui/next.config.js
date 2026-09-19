const path=require('path');
const fe=path.resolve(__dirname,"../..");
module.exports={experimental:{externalDir:true},env:{NEXT_PUBLIC_API_URL:'/api/v1'},webpack(c){
c.resolve.alias={...c.resolve.alias,
'@/hooks/useUser':path.join(__dirname,'mocks/store.ts'),
'@clerk/nextjs':path.join(__dirname,'mocks/auth.ts'),
'@/hooks/integration$':path.join(__dirname,'mocks/integration.ts'),
[path.join(fe,'src/hooks/integration/index.ts')]:path.join(__dirname,'mocks/integration.ts'),
[path.join(fe,'src/hooks/useUser.ts')]:path.join(__dirname,'mocks/store.ts'),
[path.join(fe,'src/hooks/integration/useIntegrations.ts')]:path.join(__dirname,'mocks/keys.ts'),
'@':path.join(fe,'src')};return c;}};
