import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Stethoscope, Lightbulb } from "lucide-react";
import { MedicalCase } from "@shared/schema";

interface CaseBriefProps {
  medicalCase: MedicalCase;
}

export default function CaseBrief({ medicalCase }: CaseBriefProps) {
  return (
    <div className="space-y-6 h-full overflow-y-auto p-6">
      <div>
        <h1 className="text-4xl font-bold mb-2" data-testid="text-case-title">
          {medicalCase.clinicType}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          {medicalCase.scenario}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5 text-primary" />
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
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Stethoscope className="w-5 h-5 text-primary" />
            Key Findings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            {Object.entries(medicalCase.keyFindings).map(([key, value]) => (
              <div key={key} className="border-primary pl-4">
                <dt className="text-sm font-medium mb-1">{key}</dt>
                {Array.isArray(value) ? (
                  <dd className="text-sm text-muted-foreground">
                    <ul className="space-y-1">
                      {value.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </dd>
                ) : (
                  <dd className="text-sm text-muted-foreground font-mono">{value}</dd>
                )}
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
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
