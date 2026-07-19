import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

interface ErrorPanelProps {
  readonly title: string;
  readonly description: string;
  readonly onRetry?: () => void;
}

export function ErrorPanel({ title, description, onRetry }: ErrorPanelProps) {
  return (
    <Card role="alert">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          문제가 반복되면 잠시 후 다시 시도해 주세요.
        </p>
      </CardContent>
      {onRetry ? (
        <CardFooter>
          <Button type="button" variant="outline" onClick={onRetry}>
            다시 시도
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
