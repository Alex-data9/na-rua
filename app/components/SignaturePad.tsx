import { useRef, useState } from "react";
import { Erro, Rotulo } from "./campos";

// Campo de assinatura em tela. O traço vira uma imagem PNG (data URL) num input oculto com o `name` informado.
export function SignaturePad({
  label, name, erro, obrigatorio,
}: { label: string; name: string; erro?: string; obrigatorio?: boolean }) {
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
      <p className="mb-1.5 text-sm font-semibold">
        <Rotulo obrigatorio={obrigatorio}>{label}</Rotulo>
      </p>
      <canvas
        ref={canvasRef}
        width={600}
        height={180}
        role="img"
        aria-label={`Área para desenhar: ${label}`}
        className={`w-full touch-none border bg-white bg-[linear-gradient(to_bottom,transparent_75%,#d6d4cf_75%,#d6d4cf_calc(75%+1px),transparent_calc(75%+1px))] ${erro ? "border-sinal-600" : "border-gray-400 dark:border-gray-600"}`}
        onPointerDown={iniciar}
        onPointerMove={mover}
        onPointerUp={terminar}
        onPointerCancel={terminar}
      />
      <input type="hidden" name={name} value={valor} />
      <button type="button" onClick={limpar} className="link mt-1 inline-flex min-h-11 items-center text-sm">
        Limpar assinatura
      </button>
      <Erro id={`${name}-erro`} mensagem={erro} />
    </div>
  );
}
