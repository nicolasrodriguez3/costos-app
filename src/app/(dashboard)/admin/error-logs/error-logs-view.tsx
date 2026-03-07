"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Info,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { clearOldErrorLogs } from "@/actions/errorLogs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React from "react";

type ErrorLog = {
  id: string;
  timestamp: Date;
  level: string;
  action: string;
  message: string;
  stackTrace: string | null;
  metadata: string | null;
  userId: string | null;
};

interface ErrorLogsViewProps {
  initialData: {
    logs: ErrorLog[];
    hasMore: boolean;
    totalCount: number;
  };
}

export function ErrorLogsView({ initialData }: ErrorLogsViewProps) {
  const router = useRouter();
  const [logs] = useState<ErrorLog[]>(initialData.logs);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isClearing, setIsClearing] = useState(false);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "ERROR":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "WARN":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "INFO":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "ERROR":
        return "bg-red-100 text-red-800";
      case "WARN":
        return "bg-amber-100 text-amber-800";
      case "INFO":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleClear = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar los logs de más de 30 días?",
      )
    )
      return;
    setIsClearing(true);
    await clearOldErrorLogs(30);
    setIsClearing(false);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
        <h2 className="font-semibold text-gray-800">
          Últimos Logs ({initialData.totalCount})
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={handleClear}
          disabled={isClearing}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isClearing ? "Limpiando..." : "Limpiar > 30 días"}
        </Button>
      </div>

      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead scope="col" className="w-10 px-6 py-3"></TableHead>
            <TableHead
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Nivel
            </TableHead>
            <TableHead
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Fecha
            </TableHead>
            <TableHead
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Acción
            </TableHead>
            <TableHead
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Mensaje
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-gray-200">
          {logs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="px-6 py-12 text-center text-gray-500"
              >
                No hay logs registrados.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <React.Fragment key={log.id}>
                <TableRow
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => toggleRow(log.id)}
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-400">
                    {expandedRows.has(log.id) ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getLevelIcon(log.level)}
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelBadge(
                          log.level,
                        )}`}
                      >
                        {log.level}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(log.timestamp), "dd MMM yyyy HH:mm:ss", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {log.action}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                    {log.message}
                  </TableCell>
                </TableRow>

                {expandedRows.has(log.id) && (
                  <TableRow className="bg-gray-50/50">
                    <TableCell colSpan={5} className="px-6 py-4">
                      <div className="pl-12 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">
                            Mensaje completo
                          </h4>
                          <p className="text-sm text-gray-600 font-mono bg-white p-3 rounded border">
                            {log.message}
                          </p>
                        </div>

                        {log.stackTrace && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">
                              Stack Trace
                            </h4>
                            <pre className="text-xs text-gray-600 font-mono bg-white p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                              {log.stackTrace}
                            </pre>
                          </div>
                        )}

                        {log.metadata && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">
                              Metadata
                            </h4>
                            <pre className="text-xs text-gray-600 font-mono bg-white p-3 rounded border overflow-x-auto">
                              {JSON.stringify(
                                JSON.parse(log.metadata),
                                null,
                                2,
                              )}
                            </pre>
                          </div>
                        )}

                        {log.userId && (
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">User ID:</span>{" "}
                            {log.userId}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
