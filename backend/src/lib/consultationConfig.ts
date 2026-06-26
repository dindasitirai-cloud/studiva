export function getConsultationConfig() {
  return {
    psikologName: process.env.PSIKOLOG_NAME || 'Psikolog Fitri Effendy',
    onlinePrice: Number(process.env.CONSULTATION_ONLINE_PRICE) || 300_000,
    offlinePrice: Number(process.env.CONSULTATION_OFFLINE_PRICE) || 350_000,
    onlineDuration: Number(process.env.CONSULTATION_ONLINE_DURATION) || 50,
    offlineDuration: Number(process.env.CONSULTATION_OFFLINE_DURATION) || 60,
  };
}
