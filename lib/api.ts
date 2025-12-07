export interface UploadedWorkbook {
  sheets: {
    name: string;
    rows: any[][];
  }[];
}

export interface UploadResponse {
  ok: boolean;
  workbook?: UploadedWorkbook;
  schemas?: any;
  error?: string;
}

export interface RunResponse {
  ok: boolean;
  result?: any;
  context?: any;
  error?: string;
}

const BASE_URL = "https://excelwizpro-mtm8.onrender.com";

export async function uploadWorkbookApi(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  return data;
}

export async function runEngineApi(query: string, workbook?: UploadedWorkbook): Promise<RunResponse> {
  const res = await fetch(`${BASE_URL}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query,
      workbook
    })
  });

  const data = await res.json();
  return data;
}
