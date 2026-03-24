import "./index.css";
import { QuickNotes } from "./components/QuickNotes";
import { Habits } from "./components/Habits";

function App() {
  return (
    <div className="min-h-screen bg-neutral-200 p-8 font-sans text-neutral-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <QuickNotes />
          <div className="bg-neutral-200 border-2 border-neutral-800 rounded-3xl p-6 lg:col-span-2 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="w-24"></div>
              <h2 className="text-lg font-medium">Tarefas</h2>
              <button className="border-2 border-neutral-800 rounded-lg px-3 py-1 text-sm font-medium hover:bg-neutral-300 transition">
                Nova tarefa
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium mb-4">
              <div>dom</div>
              <div>seg</div>
              <div>ter</div>
              <div>qua</div>
              <div>qui</div>
              <div>sex</div>
              <div>sab</div>
            </div>

            <div className="grid grid-cols-7 gap-2 flex-1">
              <div className="flex flex-col gap-2 border-r-2 border-neutral-800/20 pr-2">
                <div className="border-2 border-neutral-800 rounded-xl p-2 text-xs text-center">
                  Limpar a casa
                </div>
                <div className="border-2 border-neutral-800 rounded-xl p-2 text-xs text-center">
                  Estudar
                </div>
              </div>

              <div className="border-r-2 border-neutral-800/20"></div>
              <div className="border-r-2 border-neutral-800/20"></div>
              <div className="border-r-2 border-neutral-800/20"></div>
              <div className="border-r-2 border-neutral-800/20"></div>
              <div className="border-r-2 border-neutral-800/20"></div>
              <div></div>
            </div>
          </div>

          <Habits />
        </div>
      </div>
    </div>
  );
}

export default App;
