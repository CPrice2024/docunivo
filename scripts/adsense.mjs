// Ownership verification is independent of loading ads or requesting consent.
export function adsenseVerification(publisherId=''){
 if(!publisherId)return {meta:'',adsTxt:''};
 if(!/^ca-pub-\d{16}$/.test(publisherId))throw new Error('AdSense publisherId must be ca-pub- followed by 16 digits.');
 return {
  meta:`<meta name="google-adsense-account" content="${publisherId}"/>`,
  adsTxt:`google.com, ${publisherId.replace('ca-','')}, DIRECT, f08c47fec0942fa0\n`,
 };
}
