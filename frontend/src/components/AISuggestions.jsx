import { AlertCircle, CheckCircle, Activity, Apple, Moon, Heart, Users, Pill, TrendingUp } from 'lucide-react';

export default function AISuggestions({ report, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center min-h-80">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-600">AI is analyzing your report...</p>
        </div>
      </div>
    );
  }

  if (!report || !report.aiAnalysis) {
    return null;
  }

  const { aiAnalysis, reportType } = report;
  const { summary, keyFindings, riskFactors, suggestions, dailyHabits, confidenceScore } = aiAnalysis;

  const habitIcons = {
    diet: <Apple className="w-5 h-5 text-orange-500" />,
    exercise: <Activity className="w-5 h-5 text-green-500" />,
    sleep: <Moon className="w-5 h-5 text-purple-500" />,
    lifestyle: <Heart className="w-5 h-5 text-red-500" />,
    medications: <Pill className="w-5 h-5 text-blue-500" />
  };

  const habitLabels = {
    diet: 'Nutrition & Diet',
    exercise: 'Exercise & Fitness',
    sleep: 'Sleep & Rest',
    lifestyle: 'Lifestyle Changes',
    medications: 'Medications & Supplements'
  };

  return (
    <div className="space-y-6">
      {/* Header with Confidence Score */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Health Analysis</h2>
            <p className="text-gray-700">{reportType?.replace('_', ' ').toUpperCase()}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Analysis Confidence</div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{confidenceScore}%</span>
            </div>
          </div>
        </div>
        
        {summary && (
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <p className="text-gray-800 leading-relaxed">{summary}</p>
          </div>
        )}
      </div>

      {/* Key Findings */}
      {keyFindings && keyFindings.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Key Findings
          </h3>
          <ul className="space-y-2">
            {keyFindings.map((finding, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span className="text-gray-700">{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk Factors */}
      {riskFactors && riskFactors.length > 0 && (
        <div className="bg-orange-50 rounded-lg shadow-md p-6 border border-orange-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Health Risk Factors
          </h3>
          <ul className="space-y-2">
            {riskFactors.map((risk, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="text-orange-600 font-bold">⚠</span>
                <span className="text-gray-800">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Medical Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="bg-green-50 rounded-lg shadow-md p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Medical Recommendations
          </h3>
          <ul className="space-y-2">
            {suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-gray-800">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Daily Habits Section */}
      {dailyHabits && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Recommended Daily Habits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(dailyHabits).map(([key, habits]) => (
              habits && habits.length > 0 && (
                <div key={key} className="bg-white rounded-lg shadow-md p-4 border-t-4 border-gray-200 hover:shadow-lg transition">
                  <div className="flex items-center gap-2 mb-3">
                    {habitIcons[key]}
                    <h4 className="font-semibold text-gray-900 text-sm">{habitLabels[key]}</h4>
                  </div>
                  <ul className="space-y-2">
                    {habits.map((habit, idx) => (
                      <li key={idx} className="text-xs text-gray-700 leading-relaxed flex gap-2">
                        <span className="text-gray-400 flex-shrink-0">›</span>
                        <span>{habit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
        <p className="text-amber-900">
          <strong>⚕️ Medical Disclaimer:</strong> This AI analysis is for informational purposes only and cannot replace professional medical advice. 
          Please consult with your healthcare provider for accurate diagnosis and personalized treatment recommendations.
        </p>
      </div>
    </div>
  );
}
