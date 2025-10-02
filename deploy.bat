@echo off
echo ========================================
echo  Deploy Financas Pessoais - AWS S3
echo ========================================
echo.

set BUCKET_NAME=financaspessoais.sstechnologies-cloud.com
set DOMAIN_NAME=financaspessoais.sstechnologies-cloud.com

echo 1. Criando bucket S3...
aws s3 mb s3://%BUCKET_NAME% --region us-east-1

echo.
echo 2. Configurando website hosting...
aws s3 website s3://%BUCKET_NAME% --index-document index.html --error-document index.html

echo.
echo 3. Aplicando policy publica...
echo {
echo   "Version": "2012-10-17",
echo   "Statement": [
echo     {
echo       "Sid": "PublicReadGetObject",
echo       "Effect": "Allow",
echo       "Principal": "*",
echo       "Action": "s3:GetObject",
echo       "Resource": "arn:aws:s3:::%BUCKET_NAME%/*"
echo     }
echo   ]
echo } > bucket-policy.json

aws s3api put-bucket-policy --bucket %BUCKET_NAME% --policy file://bucket-policy.json

echo.
echo 4. Fazendo upload dos arquivos...
aws s3 sync . s3://%BUCKET_NAME% --exclude "*.bat" --exclude "bucket-policy.json" --exclude ".git/*"

echo.
echo 5. Obtendo Hosted Zone ID...
set HOSTED_ZONE_ID=Z07937031ROGP6XAEMPWJ

echo.
echo 6. Criando registro DNS...
echo {
echo   "Comment": "Criar subdominio financaspessoais",
echo   "Changes": [
echo     {
echo       "Action": "CREATE",
echo       "ResourceRecordSet": {
echo         "Name": "%DOMAIN_NAME%",
echo         "Type": "A",
echo         "AliasTarget": {
echo           "DNSName": "s3-website-us-east-1.amazonaws.com",
echo           "EvaluateTargetHealth": false,
echo           "HostedZoneId": "Z3AQBSTGFYJSTF"
echo         }
echo       }
echo     }
echo   ]
echo } > dns-change.json

aws route53 change-resource-record-sets --hosted-zone-id %HOSTED_ZONE_ID% --change-batch file://dns-change.json

echo.
echo 7. Limpando arquivos temporarios...
del bucket-policy.json
del dns-change.json

echo.
echo ========================================
echo  DEPLOY CONCLUIDO COM SUCESSO!
echo ========================================
echo.
echo Site disponivel em:
echo http://%DOMAIN_NAME%
echo.
echo NOTA: Para HTTPS depois, so adicionar CloudFront!
echo Aguarde 2-5 minutos para propagacao DNS
echo ========================================
pause