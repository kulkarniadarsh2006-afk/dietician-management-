"use client";

import React, { useState, useEffect, useTransition } from "react";
import { MessageSquare, Filter, X } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable, type ColumnDef } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { SearchInput } from "@/components/common/search-input";
import { Pagination } from "@/components/common/pagination";
import { ErrorState } from "@/components/common/error-state";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getWhatsAppDeliveries } from "@/lib/data";
import type { WhatsAppMessage, DeliveryStatus, PaginatedResult } from "@/types";

export default function WhatsAppDeliveryPage() {
  const [messagesResult, setMessagesResult] =
    useState<PaginatedResult<WhatsAppMessage> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [, startTransition] = useTransition();

  const fetchMessages = () => {
    setIsLoading(true);
    setHasError(false);
    startTransition(async () => {
      try {
        const result = await getWhatsAppDeliveries(
          {
            search,
            status: statusFilter,
          },
          { page: currentPage, pageSize: 6 }
        );
        setMessagesResult(result);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, currentPage]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const columns: ColumnDef<WhatsAppMessage>[] = [
    {
      key: "id",
      header: "Message ID",
      className: "w-32",
      render: (msg) => (
        <span className="font-mono text-xs text-muted-foreground">{msg.id}</span>
      ),
    },
    {
      key: "clientName",
      header: "Recipient Client",
      render: (msg) => (
        <div className="space-y-0.5">
          <span className="block font-semibold text-foreground">{msg.clientName}</span>
          <span className="block font-mono text-xs text-muted-foreground">
            {msg.recipientPhone}
          </span>
        </div>
      ),
    },
    {
      key: "messageType",
      header: "Type & Payload",
      render: (msg) => (
        <div className="space-y-0.5">
          <span className="block font-medium capitalize text-foreground">
            {msg.messageType}
          </span>
          <span className="block max-w-xs truncate font-mono text-xs text-muted-foreground">
            {msg.documentName || msg.templateName || "Standard Clinical Notice"}
          </span>
        </div>
      ),
    },
    {
      key: "timestamp",
      header: "Dispatch Time",
      render: (msg) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {msg.timestamp}
        </span>
      ),
    },
    {
      key: "status",
      header: "Delivery Status",
      render: (msg) => (
        <div className="space-y-1">
          <StatusBadge status={msg.status} size="sm" />
          {msg.failureReason && (
            <span className="block max-w-xs text-[10px] text-rose-600 dark:text-rose-400">
              {msg.failureReason}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Delivery Tracking"
        description="Comprehensive audit log of outbound template notifications, diet plan PDF deliveries, and read receipts."
        showSampleDataBadge
      />

      {/* Integration Notice Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 shadow-sm">
        <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="space-y-1 text-xs">
          <h2 className="text-sm font-semibold text-foreground">
            Meta WhatsApp Cloud API Log (Sample History)
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            The official Meta WhatsApp Cloud API wrapper (
            <code>src/integrations/whatsapp/client.ts</code>) is compiled and ready. Below
            is sample history illustrating all status states (Pending, Sent, Delivered,
            Read, Failed) for UI verification.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <SearchInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              onClear={() => setSearch("")}
              placeholder="Search by client name, telephone (+1 555-...), or message ID..."
              label="Filter WhatsApp delivery records"
            />
          </div>

          <div>
            <Select
              id="filter-delivery-status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as DeliveryStatus | "all");
                setCurrentPage(1);
              }}
              aria-label="Filter by WhatsApp delivery status"
            >
              <option value="all">All Delivery Statuses</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="read">Read</option>
              <option value="failed">Failed</option>
            </Select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(search || statusFilter !== "all") && (
          <div className="flex flex-wrap items-center gap-2 border-t pt-2 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Active filters:</span>
            {search && (
              <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">
                Query: &quot;{search}&quot;
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="rounded-full bg-muted px-2 py-0.5 font-medium capitalize text-foreground">
                Status: {statusFilter}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="ml-auto h-6 gap-1 px-2 text-xs text-primary"
            >
              <X className="h-3 w-3" /> Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Main Table or Error State */}
      {hasError ? (
        <ErrorState onRetry={fetchMessages} />
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={messagesResult?.data ?? []}
            isLoading={isLoading}
            keyExtractor={(msg) => msg.id}
            emptyTitle="No messages found matching criteria"
            emptyDescription="Try clearing your search query or selecting 'All' in the status filter."
          />

          {messagesResult && (
            <Pagination
              currentPage={messagesResult.page}
              totalPages={messagesResult.totalPages}
              totalItems={messagesResult.total}
              pageSize={messagesResult.pageSize}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      )}
    </div>
  );
}
