import { useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeDollarSign,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  GraduationCap,
  Languages,
  Loader2,
  MapPin,
  Sparkles,
  Upload,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { analyzeCV, simulate, getSalaryBySeniority } from "../services/api";

const money = (value) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatExperience = (yearsValue, monthsValue) => {
  const totalMonths =
    typeof monthsValue === "number"
      ? Math.round(monthsValue)
      : Math.round(Number(yearsValue || 0) * 12);

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts = [];

  if (years > 0) parts.push(`${years} ${years === 1 ? "an" : "ans"}`);
  if (months > 0) parts.push(`${months} mois`);

  return parts.length ? parts.join(" et ") : "0 mois";
};

const fallbackDetails = {
  full_name: "Inconnu",
  seniority_level: "Inconnu",
  city: "Inconnu",
  skills: [],
  education: [],
  education_level: "Inconnu",
  education_degree: "Inconnu",
  education_institution: "Inconnu",
  education_status: "Inconnu",
  certifications: [],
  languages: [],
  strengths: [],
  missing_keywords: [],
  profile_summary:
    "Importez un CV PDF lisible pour extraire un profil structuré et générer une estimation salariale.",
  salary_reasoning:
    "Le modèle utilise le poste extrait, l’expérience, le pays, le contexte de l’entreprise et les données du marché.",
};

function Logo() {
  return (
    <img src="/logo.png" alt="TalentIQ Logo" className="h-12 object-contain" />
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#e4e8ed] py-3 last:border-b-0">
      <span className="text-sm text-[#657487]">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-semibold text-[#102a43]">
        {value || "Inconnu"}
      </span>
    </div>
  );
}

function PillList({ items, empty = "Aucune donnée extraite" }) {
  if (!items?.length) {
    return <p className="text-sm text-[#657487]">{empty}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.slice(0, 12).map((item) => (
        <span
          key={item}
          className="rounded-full border border-[#d9e1ea] bg-white px-3 py-1.5 text-sm font-medium text-[#27384a]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="rounded-xl border border-[#dfe5ec] bg-white p-5 shadow-[0_10px_30px_rgba(16,42,67,0.05)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8f4f0] text-[#0f766e]">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-base font-semibold text-[#102a43]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function TrajectoryTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-[#dfe5ec] bg-white px-4 py-3 shadow-lg">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#657487]">
        {label} ans
      </p>
      <p className="mt-1 text-lg font-semibold text-[#102a43]">
        {money(payload[0].value)}
      </p>
    </div>
  );
}

export default function Analyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [error, setError] = useState("");
  const [seniorityData, setSeniorityData] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState("Data Scientist");

  const details = useMemo(
    () => ({ ...fallbackDetails, ...(result?.profile_details || {}) }),
    [result],
  );

  const predictionData = result?.used_for_prediction || {};

  const validTitles = [
    "Data Scientist",
    "Data Analyst",
    "Machine Learning Engineer",
    "MLOps Engineer",
    "AI Researcher",
    "Applied Scientist",
  ];

  const handleUpload = async () => {
    if (!file) {
      setError("Veuillez d’abord importer un CV au format PDF.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      setTrajectory([]);

      const analysis = await analyzeCV(file);
      setResult(analysis.data);
      localStorage.setItem("analysis_result", JSON.stringify(analysis.data));

      try {
        const seniority = await getSalaryBySeniority(
          analysis.data.used_for_prediction.job_title,
        );
        setSeniorityData(seniority.data.data || []);
        setSelectedTitle(analysis.data.used_for_prediction.job_title);
      } catch (e) {
        console.error("Seniority chart failed:", e);
      }
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.detail ||
          "L'analyse du CV a échoué. Utilisez un PDF lisible contenant du texte.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-[#102a43]">
      <header className="sticky top-0 z-40 border-b border-[#dfe5ec] bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 md:px-8">
          <Logo />
          <div className="hidden items-center gap-2 rounded-full border border-[#dfe5ec] bg-[#f7faf9] px-4 py-2 text-sm font-medium text-[#4f6073] sm:flex">
            <Sparkles className="h-4 w-4 text-[#0f766e]" />
            Analyse salariale propulsée par IA
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1280px] gap-6 px-5 py-8 md:px-8 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-5">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-[#dfe5ec] bg-white p-5 shadow-[0_12px_40px_rgba(16,42,67,0.06)]"
          >
            <div className="rounded-xl border border-dashed border-[#b7c6d8] bg-[#f8fbfa] p-6">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#dff3ec] text-[#0f766e]">
                <Upload className="h-5 w-5" />
              </div>

              <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[#102a43]">
                Analyser un CV
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#5f6f7f]">
                Importez un CV PDF pour obtenir une analyse intelligente du
                profil, une estimation salariale et des insights carrière
                avancés.
              </p>

              <input
                id="cv-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(event) => {
                  const selected = event.target.files?.[0];
                  if (selected) {
                    setFile(selected);
                    setError("");
                  }
                }}
              />

              <label
                htmlFor="cv-upload"
                className="mt-6 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#cfd9e5] bg-white px-4 py-3 text-sm font-semibold text-[#102a43] transition hover:border-[#0f766e] hover:text-[#0f766e]"
              >
                <FileText className="h-4 w-4" />
                Importer un CV PDF
              </label>

              {file && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-[#4f6073]">
                  <CheckCircle2 className="h-4 w-4 text-[#0f766e]" />
                  <span className="truncate">{file.name}</span>
                </div>
              )}

              {error && (
                <div className="mt-3 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={loading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0f766e] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115e59] disabled:cursor-not-allowed disabled:bg-[#9bb7b3]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyse du CV en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Lancer l’analyse
                  </>
                )}
              </button>
            </div>
          </motion.section>

          <Section icon={BriefcaseBusiness} title="Données du modèle">
            <InfoRow label="Poste" value={predictionData.job_title} />
            <InfoRow
              label="Expérience"
              value={
                predictionData.min_experience_years !== undefined
                  ? formatExperience(
                      predictionData.min_experience_years,
                      predictionData.min_experience_months,
                    )
                  : "Inconnu"
              }
            />
            <InfoRow label="Pays" value={predictionData.country} />
          </Section>
        </aside>

        <div className="space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-[#dfe5ec] bg-[#102a43] p-6 text-white shadow-[0_18px_50px_rgba(16,42,67,0.16)]"
          >
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#9fd8ce]">
                  Rapport d’analyse du CV
                </p>
                <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
                  {result
                    ? details.full_name !== "Inconnu"
                      ? details.full_name
                      : predictionData.job_title
                    : "Importez un CV pour générer un rapport complet du profil"}
                </h2>

                <p className="mt-4 max-w-3xl text-base leading-7 text-[#d5e1ea]">
                  {details.profile_summary}
                </p>
              </div>

              <div className="rounded-xl border border-white/15 bg-white/8 p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#9fd8ce] text-[#102a43]">
                    <BadgeDollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-[#c4d3df]">Salaire estimé</p>
                    <p className="text-4xl font-semibold tracking-tight">
                      {result ? money(result.predicted_salary) : "$0"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-white/10 p-3">
                    <p className="text-xs text-[#c4d3df]">Score du profil</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {result?.score || "--"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/10 p-3">
                    <p className="text-xs text-[#c4d3df]">
                      Position sur le marché
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {result?.market_position || "En attente"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <Section icon={Sparkles} title="Analyse salariale par IA">
              <p className="text-sm leading-6 text-[#4f6073]">
                {details.salary_reasoning}
              </p>
              <div className="mt-4 space-y-3">
                {(result?.explanation || []).map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-lg bg-[#f7faf9] p-3 text-sm leading-6 text-[#3c4f63]"
                  >
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#0f766e]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={MapPin} title="Profil extrait">
              <InfoRow
                label="Niveau d’expérience"
                value={details.seniority_level}
              />
              <InfoRow label="Localisation" value={details.city} />
              {details.education?.length > 0 ? (
                details.education.map((edu, i) => (
                  <InfoRow
                    key={i}
                    label={i === 0 ? "Formation" : ""}
                    value={`${edu.degree} - ${edu.institution} (${edu.status})`}
                  />
                ))
              ) : (
                <>
                  <InfoRow label="Formation" value={details.education_level} />
                  <InfoRow
                    label="Établissement"
                    value={details.education_institution}
                  />
                </>
              )}
              <InfoRow
                label="Percentile"
                value={result?.percentile || "En attente"}
              />
              <InfoRow label="Niveau du profil" value={result?.score_label} />
            </Section>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Section icon={BarChart3} title="Compétences clés">
              <PillList items={details.skills} />
            </Section>

            <Section icon={GraduationCap} title="Points forts">
              <PillList items={details.strengths} />
            </Section>

            <Section icon={Languages} title="Langues et certifications">
              <PillList
                items={[...details.languages, ...details.certifications]}
              />
            </Section>
          </div>

          <Section icon={AlertCircle} title="Mots-clés manquants">
            <PillList
              items={details.missing_keywords}
              empty="Aucun mot-clé manquant n’a été identifié par l’IA."
            />
          </Section>

          {seniorityData.length > 0 && (
            <Section
              icon={BarChart3}
              title={`Salaire médian par niveau — ${selectedTitle}`}
            >
              <p className="mb-5 text-sm leading-6 text-[#5f6f7f]">
                Salaires médians issus du dataset réel, filtrés par poste et
                niveau d'expérience.
              </p>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seniorityData}>
                    <CartesianGrid stroke="#e6ebf0" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="seniority"
                      axisLine={false}
                      tickLine={false}
                      stroke="#657487"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      stroke="#657487"
                      tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      formatter={(value) => [money(value), "Salaire médian"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #dfe5ec",
                        fontSize: "13px",
                      }}
                    />
                    <Bar
                      dataKey="salary"
                      fill="#0f766e"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Section>
          )}
        </div>
      </main>
    </div>
  );
}
