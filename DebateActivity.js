import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function DebateActivity() {
  const [screen, setScreen] = useState("lobby"); // lobby, debate, voting, results
  const [timer, setTimer] = useState(60);
  const [debater1, setDebater1] = useState("?");
  const [debater2, setDebater2] = useState("?");
  const [votes, setVotes] = useState({ debater1: 0, debater2: 0 });

  function startDebate() {
    setDebater1("User1"); // Placeholder, should be randomly assigned
    setDebater2("User2"); // Placeholder
    setScreen("debate");
    startTimer();
  }

  function startTimer() {
    let countdown = 60;
    const interval = setInterval(() => {
      countdown -= 1;
      setTimer(countdown);
      if (countdown <= 0) {
        clearInterval(interval);
        setScreen("voting");
      }
    }, 1000);
  }

  function voteFor(winner) {
    setVotes(prev => ({ ...prev, [winner]: prev[winner] + 1 }));
    setScreen("results");
  }

  return (
    <div className="p-4 space-y-4">
      {screen === "lobby" && (
        <Card>
          <CardContent>
            <h2 className="text-xl font-bold">Debate Lobby</h2>
            <p>Waiting for host to start...</p>
            <Button onClick={startDebate}>Start Debate</Button>
          </CardContent>
        </Card>
      )}

      {screen === "debate" && (
        <Card>
          <CardContent>
            <h2 className="text-xl font-bold">Debate in Progress</h2>
            <p>{debater1} vs {debater2}</p>
            <Progress value={(timer / 60) * 100} />
            <p>Time Remaining: {timer}s</p>
          </CardContent>
        </Card>
      )}

      {screen === "voting" && (
        <Card>
          <CardContent>
            <h2 className="text-xl font-bold">Vote for the Winner</h2>
            <Button onClick={() => voteFor("debater1")} className="mr-2">{debater1}</Button>
            <Button onClick={() => voteFor("debater2")}>{debater2}</Button>
          </CardContent>
        </Card>
      )}

      {screen === "results" && (
        <Card>
          <CardContent>
            <h2 className="text-xl font-bold">Debate Results</h2>
            <p>{debater1}: {votes.debater1} votes</p>
            <p>{debater2}: {votes.debater2} votes</p>
            <Button onClick={() => setScreen("lobby")}>New Debate</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
