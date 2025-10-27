import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Stethoscope, Lightbulb } from "lucide-react";
import { MedicalCase } from "@shared/schema";

interface CaseBriefProps {
  medicalCase: MedicalCase;
}

export default function CaseBrief({ medicalCase }: CaseBriefProps) {
  return (
    <div className="space-y-4 h-full overflow-y-auto p-4">
      <div>
        <h1 className="text-2xl font-semibold mb-1" data-testid="text-case-title">
          {medicalCase.clinicType}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {medicalCase.scenario}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4 text-primary" />
            Triage Note
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed" data-testid="text-triage-note">
            {medicalCase.triageNote}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="w-4 h-4 text-primary" />
            Key Findings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            {Object.entries(medicalCase.keyFindings).map(([key, value]) => (
              <div key={key} className="border-primary pl-3">
                <dt className="text-xs font-medium mb-1">{key}</dt>
                {Array.isArray(value) ? (
                  <dd className="text-xs text-muted-foreground">
                    <ul className="space-y-0.5">
                      {value.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </dd>
                ) : (
                  <dd className="text-xs text-muted-foreground font-mono">{value}</dd>
                )}
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center p-0">
              ✓
            </Badge>
            Your Task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed" data-testid="text-task">
            {medicalCase.task}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
