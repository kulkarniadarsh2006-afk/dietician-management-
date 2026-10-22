"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { UserPlus, Filter, X, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { DataTable, type ColumnDef } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { SearchInput } from "@/components/common/search-input";
import { Pagination } from "@/components/common/pagination";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getClients, createClient } from "@/lib/data";
import type { Client, DietPlanStatus, DeliveryStatus, PaginatedResult } from "@/types";

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const initialAddOpen = searchParams.get("action") === "add";

  const [clientsResult, setClientsResult] = useState<PaginatedResult<Client> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Filter state
  const [search, setSearch] = useState("");
  const [dietPlanStatus, setDietPlanStatus] = useState<DietPlanStatus | "all">("all");
  const [messageStatus, setMessageStatus] = useState<DeliveryStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Add Client Modal state
  const [isAddOpen, setIsAddOpen] = useState(initialAddOpen);
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addGoal, setAddGoal] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [, startTransition] = useTransition();

  const fetchClients = () => {
    setIsLoading(true);
    setHasError(false);
    startTransition(async () => {
      try {
        const result = await getClients(
          {
            search,
            dietPlanStatus,
            messageStatus,
          },
          { page: currentPage, pageSize: 6 }
        );
        setClientsResult(result);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, dietPlanStatus, messageStatus, currentPage]);

  const handleResetFilters = () => {
    setSearch("");
    setDietPlanStatus("all");
    setMessageStatus("all");
    setCurrentPage(1);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!addName.trim() || addName.trim().length < 2) {
      errors.name = "Full name must be at least 2 characters.";
    }
    if (!addPhone.trim()) {
      errors.phone = "Phone number is required for WhatsApp communication.";
    } else if (!/^\+?[0-9\s-()]{7,20}$/.test(addPhone.trim())) {
      errors.phone = "Please enter a valid telephone format (e.g., +1 555-0100).";
    }
    if (!addEmail.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addEmail.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await createClient({
        name: addName.trim(),
        phone: addPhone.trim(),
        email: addEmail.trim(),
        primaryGoal: addGoal.trim() || "General nutrition assessment",
        dietPlanStatus: "none",
        allergies: [],
        dietaryPreferences: [],
        medicalConditions: [],
        intakeCompleted: false,
      });

      // Reset form and close
      setAddName("");
      setAddPhone("");
      setAddEmail("");
      setAddGoal("");
      setFormErrors({});
      setIsAddOpen(false);
      fetchClients();
    } catch {
      alert("Failed to create client record. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnDef<Client>[] = [
    {
      key: "name",
      header: "Client Name & ID",
      render: (client) => (
        <div className="space-y-0.5">
          <Link
            href={`/clients/${client.id}`}
            className="block font-semibold text-foreground transition-colors hover:text-primary hover:underline"
          >
            {client.name}
          </Link>
          <span className="block font-mono text-xs text-muted-foreground">
            {client.id}
          </span>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone Number",
      render: (client) => (
        <span className="font-mono text-xs text-foreground">{client.phone}</span>
      ),
    },
    {
      key: "registrationDate",
      header: "Registered",
      render: (client) => (
        <span className="text-xs text-muted-foreground">{client.registrationDate}</span>
      ),
    },
    {
      key: "dietPlanStatus",
      header: "Diet Plan Status",
      render: (client) => <StatusBadge status={client.dietPlanStatus} size="sm" />,
    },
    {
      key: "lastMessageStatus",
      header: "Last WhatsApp Status",
      render: (client) => <StatusBadge status={client.lastMessageStatus} size="sm" />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right w-12",
      render: (client) => (
        <Link
          href={`/clients/${client.id}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={`View clinical file for ${client.name}`}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Client Caseload Directory"
        description="Search, filter, and review active client records and diet plan statuses."
        showSampleDataBadge
      >
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          <span>Add Client</span>
        </Button>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="mb-6 space-y-3 rounded-xl border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <SearchInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              onClear={() => setSearch("")}
              placeholder="Search by name, phone (+1 555-...), ID, or email..."
              label="Filter clients by keyword"
            />
          </div>

          <div>
            <Select
              id="filter-diet-plan"
              value={dietPlanStatus}
              onChange={(e) => {
                setDietPlanStatus(e.target.value as DietPlanStatus | "all");
                setCurrentPage(1);
              }}
              aria-label="Filter by diet plan status"
            >
              <option value="all">All Diet Plan Statuses</option>
              <option value="assigned">Assigned</option>
              <option value="pending">Pending</option>
              <option value="none">None</option>
            </Select>
          </div>

          <div>
            <Select
              id="filter-message-status"
              value={messageStatus}
              onChange={(e) => {
                setMessageStatus(e.target.value as DeliveryStatus | "all");
                setCurrentPage(1);
              }}
              aria-label="Filter by message delivery status"
            >
              <option value="all">All WhatsApp Statuses</option>
              <option value="read">Read</option>
              <option value="delivered">Delivered</option>
              <option value="sent">Sent</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </Select>
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(search || dietPlanStatus !== "all" || messageStatus !== "all") && (
          <div className="flex flex-wrap items-center gap-2 border-t pt-2 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Active filters:</span>
            {search && (
              <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">
                Query: &quot;{search}&quot;
              </span>
            )}
            {dietPlanStatus !== "all" && (
              <span className="rounded-full bg-muted px-2 py-0.5 font-medium capitalize text-foreground">
                Plan: {dietPlanStatus}
              </span>
            )}
            {messageStatus !== "all" && (
              <span className="rounded-full bg-muted px-2 py-0.5 font-medium capitalize text-foreground">
                Message: {messageStatus}
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
        <ErrorState onRetry={fetchClients} />
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={clientsResult?.data ?? []}
            isLoading={isLoading}
            keyExtractor={(client) => client.id}
            emptyTitle="No clients match your filter criteria"
            emptyDescription="Try clearing your search term or selecting 'All' in the status filters."
          />

          {/* Pagination */}
          {clientsResult && (
            <Pagination
              currentPage={clientsResult.page}
              totalPages={clientsResult.totalPages}
              totalItems={clientsResult.total}
              pageSize={clientsResult.pageSize}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      )}

      {/* Add Client Accessible Modal Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent onClose={() => setIsAddOpen(false)}>
          <DialogHeader>
            <DialogTitle>Enroll New Patient</DialogTitle>
            <DialogDescription>
              Create a clinical patient profile. Required for diet plan assignment and
              WhatsApp dispatch.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddClientSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="client-name"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Full Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="client-name"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="e.g. Sample Client 09 (Taylor Swift)"
                required
                aria-invalid={!!formErrors.name}
              />
              {formErrors.name && (
                <p className="text-xs text-destructive">{formErrors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="client-phone"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  WhatsApp Phone <span className="text-destructive">*</span>
                </label>
                <Input
                  id="client-phone"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  placeholder="+1 555-0109"
                  required
                  aria-invalid={!!formErrors.phone}
                />
                {formErrors.phone && (
                  <p className="text-xs text-destructive">{formErrors.phone}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="client-email"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Email Address <span className="text-destructive">*</span>
                </label>
                <Input
                  id="client-email"
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="client09@example.com"
                  required
                  aria-invalid={!!formErrors.email}
                />
                {formErrors.email && (
                  <p className="text-xs text-destructive">{formErrors.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="client-goal"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Primary Nutrition Goal
              </label>
              <Input
                id="client-goal"
                value={addGoal}
                onChange={(e) => setAddGoal(e.target.value)}
                placeholder="e.g. Weight management, Gestational Diabetes, High cholesterol"
              />
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
              <strong>Notice:</strong> This patient record will be saved in the client
              mock data store for this session without saving to a persistent database.
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving Client..." : "Enroll Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
