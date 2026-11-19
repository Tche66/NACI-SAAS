import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d2818] via-[#0f1117] to-[#1a1d27]" />
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-block bg-[#00e676]/10 border border-[#00e676]/30 rounded-full px-4 py-1 text-sm text-[#00e676] font-semibold mb-6">
            3 modeles IA &bull; 15 800+ tirages analyses
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Gagne au <span className="text-[#00e676]">Loto Bonheur</span>
            <br />avec l&apos;Intelligence Artificielle
          </h1>
          <p className="text-lg text-[#9aa0a6] max-w-2xl mx-auto mb-10">
            Bot + Reseau Neuronal + LSTM analysent 6 ans de tirages pour predire
            les meilleurs numeros. Suis tes paris et optimise tes gains.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-[#00e676] text-black font-bold px-8 py-4 rounded-xl text-lg hover:bg-[#69f0ae] transition-colors"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/pricing"
              className="border border-[#2d3140] text-[#e8eaed] font-semibold px-8 py-4 rounded-xl text-lg hover:border-[#00e676] hover:text-[#00e676] transition-colors"
            >
              Voir les tarifs
            </Link>
          </div>
          <p className="text-sm text-[#9aa0a6] mt-4">2 predictions gratuites par jour &bull; Pas de carte requise</p>
        </div>
      </header>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { val: "15 800+", label: "Tirages analyses", color: "#00e676" },
            { val: "6 ans", label: "De donnees", color: "#448aff" },
            { val: "3", label: "Modeles IA", color: "#e040fb" },
            { val: "+951%", label: "ROI backtest", color: "#ffd740" },
          ].map((s) => (
            <div key={s.label} className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-6 text-center">
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.val}</div>
              <div className="text-xs text-[#9aa0a6] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">Comment ca marche</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "🤖",
              title: "3 Sources IA",
              desc: "Bot statistique, Reseau Neuronal et LSTM analysent chaque tirage independamment, puis votent pour les meilleurs numeros.",
            },
            {
              icon: "🎯",
              title: "Predictions ciblees",
              desc: "Chaque tirage (Sika, Afterwork, Digital...) a ses propres predictions. On te dit lesquels jouer et lesquels eviter.",
            },
            {
              icon: "📊",
              title: "Suivi des gains",
              desc: "Enregistre tes paris, suis tes resultats en temps reel. ROI par source, par tirage, par jour. Tout est mesure.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-[#9aa0a6]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-4">Tarifs simples</h2>
        <p className="text-center text-[#9aa0a6] mb-12">Commence gratuitement, paye quand tu veux plus</p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-6">
            <div className="text-sm font-semibold text-[#9aa0a6] mb-2">GRATUIT</div>
            <div className="text-3xl font-black mb-1">0<span className="text-lg text-[#9aa0a6]"> FCFA</span></div>
            <div className="text-xs text-[#9aa0a6] mb-6">pour toujours</div>
            <ul className="space-y-2 text-sm">
              <li className="text-[#00e676]">&#10003; 2 predictions / jour</li>
              <li className="text-[#00e676]">&#10003; Suivi des paris</li>
              <li className="text-[#9aa0a6]">&#10007; Predictions illimitees</li>
              <li className="text-[#9aa0a6]">&#10007; Backtest avance</li>
            </ul>
          </div>
          <div className="bg-[#1a1d27] border-2 border-[#00e676] rounded-xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00e676] text-black text-xs font-bold px-3 py-1 rounded-full">POPULAIRE</div>
            <div className="text-sm font-semibold text-[#00e676] mb-2">PASS 24H</div>
            <div className="text-3xl font-black mb-1">100<span className="text-lg text-[#9aa0a6]"> FCFA</span></div>
            <div className="text-xs text-[#9aa0a6] mb-6">24 heures d&apos;acces</div>
            <ul className="space-y-2 text-sm">
              <li className="text-[#00e676]">&#10003; Predictions illimitees</li>
              <li className="text-[#00e676]">&#10003; Tous les tirages</li>
              <li className="text-[#00e676]">&#10003; Suivi des paris</li>
              <li className="text-[#00e676]">&#10003; Grille des gains</li>
            </ul>
          </div>
          <div className="bg-[#1a1d27] border border-[#2d3140] rounded-xl p-6">
            <div className="text-sm font-semibold text-[#ffd740] mb-2">MENSUEL</div>
            <div className="text-3xl font-black mb-1">2 000<span className="text-lg text-[#9aa0a6]"> FCFA</span></div>
            <div className="text-xs text-[#9aa0a6] mb-6">par mois</div>
            <ul className="space-y-2 text-sm">
              <li className="text-[#00e676]">&#10003; Tout le Pass 24h</li>
              <li className="text-[#00e676]">&#10003; Backtest avance</li>
              <li className="text-[#00e676]">&#10003; Alertes tirages</li>
              <li className="text-[#00e676]">&#10003; Historique complet</li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-8">
          <Link
            href="/login"
            className="bg-[#00e676] text-black font-bold px-8 py-4 rounded-xl text-lg hover:bg-[#69f0ae] transition-colors inline-block"
          >
            Commencer maintenant
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2d3140] py-8 text-center text-sm text-[#9aa0a6]">
        <p>LONACI Pro &bull; Predictions intelligentes pour le Loto Bonheur</p>
        <p className="mt-1">Paiement securise par SaaSPay &bull; Orange Money, MTN MoMo, Wave</p>
      </footer>
    </div>
  );
}
