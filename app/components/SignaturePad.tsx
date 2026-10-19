import { useRef, useState } from "react";
import { Erro } from "./campos";

// Campo de assinatura em tela. O traço vira uma imagem PNG (data URL) num input oculto com o `name` informado.
export function SignaturePad({ label, name, erro }: { label: string; name: string; erro?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const desenhando = useRef(false);
  const [valor, setValor] = useState("");

  function ponto(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  }

  function iniciar(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = ponto(e);
    canvasRef.current!.setPointerCapture(e.pointerId);
    desenhando.current = true;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.01, y);
    ctx.stroke();
  }

  function mover(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!desenhando.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = ponto(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function terminar() {
    if (!desenhando.current) return;
    desenhando.current = false;
    setValor(canvasRef.current!.toDataURL("image/png"));
  }

  function limpar() {
    const c = canvasRef.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setValor("");
  }

  return (
    <div>
      <p className="text-sm font-medium mb-1">{label}</p>
      <canvas
        ref={canvasRef}
        width={600}
        height={180}
        role="img"
        aria-label={`Área para desenhar: ${label}`}
        className={`w-full touch-none rounded border bg-white ${erro ? "border-red-500" : ""}`}
        onPointerDown={iniciar}
        onPointerMove={mover}
        onPointerUp={terminar}
        onPointerCancel={terminar}
      />
      <input type="hidden" name={name} value={valor} />
      <button type="button" onClick={limpar} className="mt-1 text-sm underline">
        Limpar assinatura
      </button>
      <Erro id={`${name}-erro`} mensagem={erro} />
    </div>
  );
}
