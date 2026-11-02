import {hindi} from './hindi.ts';
export const languages=[
 {code:'en',name:'English',ocr:'eng'},
 {code:'hi',name:'हिन्दी',ocr:'hin'},
 {code:'fr',name:'Français',ocr:'fra'},
 {code:'es',name:'Español',ocr:'spa'},
] as const;
export type Language=typeof languages[number]['code'];
export function supportedLanguage(value:unknown):Language|undefined{
 if(typeof value!=='string')return undefined;
 const code=value.toLowerCase().split(/[-_]/)[0];
 return languages.find(language=>language.code===code)?.code;
}
export function suggestedLanguage(preferences:readonly string[]):Language{
 for(const preference of preferences){const language=supportedLanguage(preference);if(language)return language;}
 return 'en';
}
export const translations:Record<Exclude<Language,'en'>,Record<string,string>>={
 hi:hindi,
 fr:{
 'Tools':'Outils','How it works':'Mode d’emploi','FAQ':'FAQ','Files stay on your device':'Vos fichiers restent sur votre appareil','Processed locally':'Traitement local',
 'Image to Text':'Image en texte','Image to Excel':'Image vers Excel','Receipt to CSV':'Reçu vers CSV','PDF OCR':'OCR PDF','Background Remover':'Suppression d’arrière-plan',
 'Extract and edit text':'Extraire et modifier du texte','Turn tables into cells':'Convertir les tableaux en cellules','Organize items and totals':'Organiser les articles et totaux','Read scanned PDF pages':'Lire des pages PDF numérisées','Create a transparent cutout':'Créer une image détourée',
 'Upload your image':'Importer votre image','Click to upload or drag and drop':'Cliquez ou glissez-déposez une image','Your image stays in your browser':'Votre image reste dans votre navigateur','Browse image':'Choisir une image','Change':'Changer','Reset original':'Rétablir l’original','Extract text':'Extraire le texte','Extracting text...':'Extraction du texte...',
 'Extracted result':'Résultat extrait','Review receipt items and totals':'Vérifier les articles et totaux du reçu','Review and edit cells before spreadsheet export':'Vérifier les cellules avant l’export','Review and edit the recognized text':'Vérifier et modifier le texte reconnu','Processing':'Traitement','No text':'Aucun texte','Review needed':'Vérification requise','Ready':'Prêt','Waiting for image':'En attente d’une image',
 'Copy text':'Copier le texte','Copied':'Copié','Download TXT':'Télécharger TXT','Download CSV':'Télécharger CSV','Download XLSX':'Télécharger XLSX','Remove background':'Supprimer l’arrière-plan','Removing background...':'Suppression en cours...','Download transparent PNG':'Télécharger le PNG transparent','Cancel':'Annuler','Original':'Original','Background removed':'Arrière-plan supprimé','Preview background':'Fond d’aperçu','White':'Blanc','Dark':'Sombre','Blue':'Bleu','Transparency checkerboard':'Damier de transparence',
 'About':'À propos','Privacy':'Confidentialité','Terms':'Conditions','Contact':'Contact','Files processed on your device':'Fichiers traités sur votre appareil','Skip to content':'Aller au contenu','Advertisement':'Publicité','Document language':'Langue du document','Interface language':'Langue du site',
 'Scanned PDF OCR':'OCR de PDF numérisé','Copy all pages':'Copier toutes les pages','Frequently asked questions':'Questions fréquentes','Your extracted text will appear here after processing...':'Votre texte apparaîtra ici après le traitement...',
 },
 es:{
 'Tools':'Herramientas','How it works':'Cómo funciona','FAQ':'Preguntas','Files stay on your device':'Los archivos permanecen en tu dispositivo','Processed locally':'Procesamiento local',
 'Image to Text':'Imagen a texto','Image to Excel':'Imagen a Excel','Receipt to CSV':'Recibo a CSV','PDF OCR':'OCR de PDF','Background Remover':'Eliminar fondo',
 'Extract and edit text':'Extraer y editar texto','Turn tables into cells':'Convertir tablas en celdas','Organize items and totals':'Organizar artículos y totales','Read scanned PDF pages':'Leer páginas PDF escaneadas','Create a transparent cutout':'Crear una imagen sin fondo',
 'Upload your image':'Sube tu imagen','Click to upload or drag and drop':'Haz clic o arrastra y suelta una imagen','Your image stays in your browser':'Tu imagen permanece en tu navegador','Browse image':'Elegir imagen','Change':'Cambiar','Reset original':'Restaurar original','Extract text':'Extraer texto','Extracting text...':'Extrayendo texto...',
 'Extracted result':'Resultado extraído','Review receipt items and totals':'Revisa los artículos y totales del recibo','Review and edit cells before spreadsheet export':'Revisa y edita las celdas antes de exportar','Review and edit the recognized text':'Revisa y edita el texto reconocido','Processing':'Procesando','No text':'Sin texto','Review needed':'Revisión necesaria','Ready':'Listo','Waiting for image':'Esperando imagen',
 'Copy text':'Copiar texto','Copied':'Copiado','Download TXT':'Descargar TXT','Download CSV':'Descargar CSV','Download XLSX':'Descargar XLSX','Remove background':'Eliminar fondo','Removing background...':'Eliminando fondo...','Download transparent PNG':'Descargar PNG transparente','Cancel':'Cancelar','Original':'Original','Background removed':'Fondo eliminado','Preview background':'Fondo de vista previa','White':'Blanco','Dark':'Oscuro','Blue':'Azul','Transparency checkerboard':'Cuadrícula de transparencia',
 'About':'Acerca de','Privacy':'Privacidad','Terms':'Condiciones','Contact':'Contacto','Files processed on your device':'Archivos procesados en tu dispositivo','Skip to content':'Saltar al contenido','Advertisement':'Publicidad','Document language':'Idioma del documento','Interface language':'Idioma del sitio',
 'Scanned PDF OCR':'OCR de PDF escaneado','Copy all pages':'Copiar todas las páginas','Frequently asked questions':'Preguntas frecuentes','Your extracted text will appear here after processing...':'El texto extraído aparecerá aquí después del procesamiento...',
 },
};
