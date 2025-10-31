import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { makeRequisition, resetMakeRequisition } from '@/redux/slices/requisitionSlice';
import { getParts, getPersons, resetPerson, resetPart } from '@/redux/slices/searchSlice';
import ImageUpload from '@/components/ImageUpload';
import { FileText, Package, User, Building, ArrowRight, AlertCircle, CheckCircle, Check, ChevronsUpDown, X } from 'lucide-react';

// Import types from searchSlice
type Person = {
  PER_CODE: string;
  PER_DESC: string;
  PER_TRADE?: string;
};

type Part = {
  PAR_CODE: string;
  PAR_DESC: string;
  BIS_QTY: number;
  PAR_ORG: string;
};

type Store = {
  STR_CODE: string;
  STR_DESC: string;
  STR_ORG: string;
};

export default function CreateRequisition() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userState = useAppSelector((state) => state.user);
  const requisitionState = useAppSelector((state) => state.requisition);
  const searchState = useAppSelector((state) => state.search);

  // Form state
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [selectedFromStore, setSelectedFromStore] = useState<Store | null>(null);
  const [selectedToStore, setSelectedToStore] = useState<Store | null>(null);
  const [description, setDescription] = useState('');
  const [personSearch, setPersonSearch] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [personDropdownOpen, setPersonDropdownOpen] = useState(false);
  const [partSearch, setPartSearch] = useState('');
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [partDropdownOpen, setPartDropdownOpen] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Available options
  const [organizations, setOrganizations] = useState<Array<{ value: string; label: string }>>([]);
  const [fromStores, setFromStores] = useState<Store[]>([]);
  const [toStores, setToStores] = useState<Store[]>([]);
  const [personResults, setPersonResults] = useState<Person[]>([]);
  const [partResults, setPartResults] = useState<Part[]>([]);

  // Initialize organizations on mount
  useEffect(() => {
    if (userState.user?.userOrganizations) {
      const orgs = userState.user.userOrganizations
        .filter((org: any) => org?.UOG_ORG !== "*" && org?.UOG_ORG !== "FGM")
        .map((org: any) => ({
          value: org.UOG_ORG,
          label: org.UOG_ORG,
        }));
      setOrganizations(orgs);

      // Set default organization if available
      const defaultOrg = userState.user.userOrganizations.find((org: any) => org.UOG_DEFAULT === "+");
      if (defaultOrg) {
        setSelectedOrganization(defaultOrg.UOG_ORG);
      }
    }
  }, [userState.user]);

  // Update stores when organization changes
  useEffect(() => {
    if (selectedOrganization && userState.user?.userStores) {
      const orgStores = userState.user.userStores.filter((store: any) => store?.STR_ORG === selectedOrganization);

      setFromStores(orgStores);
      setToStores(orgStores);

      // Reset selections
      setSelectedFromStore(null);
      setSelectedToStore(null);
      setSelectedPerson(null);
      setSelectedPart(null);
      setPersonSearch('');
      setPersonDropdownOpen(false);
      setPartSearch('');
      setPartDropdownOpen(false);
      setQuantity('');
    }
  }, [selectedOrganization, userState.user]);

  // Update search results
  useEffect(() => {
    const results = searchState.persons ? [...searchState.persons] : [];
    setPersonResults(results);
    // Keep dropdown open if there are results and user is actively searching
    if (results.length > 0 && personSearch.trim()) {
      setPersonDropdownOpen(true);
    }
  }, [searchState.persons, personSearch]);

  useEffect(() => {
    const results = searchState.parts ? [...searchState.parts] : [];
    setPartResults(results);
    // Keep dropdown open if there are results and user is actively searching
    if (results.length > 0 && partSearch.trim()) {
      setPartDropdownOpen(true);
    }
  }, [searchState.parts, partSearch]);

  // Handle quantity input with validation
  const handleQuantityChange = (value: string) => {
    setQuantity(value);

    // Clear previous quantity errors
    if (errors.quantity) {
      setErrors(prev => ({ ...prev, quantity: undefined }));
    }

    // Real-time validation
    if (value.trim() && selectedPart) {
      const qty = parseFloat(value);
      if (isNaN(qty) || qty <= 0) {
        setErrors(prev => ({ ...prev, quantity: 'Quantity must be a positive number' }));
      } else if (qty > selectedPart.BIS_QTY) {
        setErrors(prev => ({ ...prev, quantity: `Quantity cannot exceed available stock (${selectedPart.BIS_QTY})` }));
      }
    }
  };

  // Handle person search
  const handlePersonSearch = (value: string) => {
    setPersonSearch(value);
    if (value.trim()) {
      dispatch(getPersons({ value: value.trim() }));
      setPersonDropdownOpen(true);
    } else {
      setPersonResults([]);
      setPersonDropdownOpen(false);
    }
  };

  // Handle part search
  const handlePartSearch = (value: string) => {
    setPartSearch(value);
    if (value.trim() && selectedFromStore) {
      dispatch(getParts({
        search: { value: value.trim(), fromStore: selectedFromStore.STR_CODE }
      }));
      setPartDropdownOpen(true);
    } else {
      setPartResults([]);
      setPartDropdownOpen(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedOrganization) newErrors.organization = 'Organization is required';
    if (!selectedFromStore) newErrors.fromStore = 'From store is required';
    if (!selectedToStore) newErrors.toStore = 'To store is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!selectedPerson) newErrors.person = 'Requested by person is required';
    if (!selectedPart) newErrors.part = 'Part is required';
    if (!quantity.trim()) newErrors.quantity = 'Quantity is required';

    if (selectedFromStore && selectedToStore && selectedFromStore.STR_CODE === selectedToStore.STR_CODE) {
      newErrors.stores = 'From and To stores cannot be the same';
    }

    if (quantity && selectedPart) {
      const qty = parseFloat(quantity);
      if (isNaN(qty) || qty <= 0) {
        newErrors.quantity = 'Quantity must be a positive number';
      } else if (qty > selectedPart.BIS_QTY) {
        newErrors.quantity = `Quantity cannot exceed available stock (${selectedPart.BIS_QTY})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // For web client, use a placeholder IP
      const ip = 'web-client-ip';

      const request = {
        user: userState.user,
        ip: ip,
        requisition: {
          requisition_code: "",
          requisition_description: description,
          requisition_created_byId: userState.user?.USR_CODE,
          requisition_created_byName: userState.user?.USR_DESC,
          requisition_infor_usergroup: userState.user?.USR_GROUP,
          requisition_created_fromStoreId: selectedFromStore?.STR_CODE,
          requisition_created_fromStoreDesc: selectedFromStore?.STR_DESC,
          requisition_created_fromStoreOrg: selectedFromStore?.STR_ORG,
          requisition_created_toStoreId: selectedToStore?.STR_CODE,
          requisition_created_toStoreDesc: selectedToStore?.STR_DESC,
          requisition_created_toStoreOrg: selectedToStore?.STR_ORG,
          requisition_created_requistedById: selectedPerson?.PER_CODE,
          requisition_created_requistedByDesc: selectedPerson?.PER_DESC,
          requisition_created_toOrganization: selectedOrganization,
          requisition_status_desc: "Unfinished",
          requisition_status_code: "U",
          requisition_delete: "0",
          requisition_printed: "0",
        },
        part: {
          requisitioncode: "",
          fromstore: selectedFromStore?.STR_CODE,
          part: selectedPart?.PAR_CODE,
          description: selectedPart?.PAR_DESC,
          quantity: parseFloat(quantity),
          organization: selectedPart?.PAR_ORG,
        },
        document: {
          requisitioncode: "",
          image_entity: "requisition",
          documentInforType: "REQ",
          path: selectedImage ? "uploaded_image" : "",
          type: selectedImage ? selectedImage.type : "image/jpeg",
          name: selectedImage ? selectedImage.name : "photo.jpg",
        },
        other: {
          selectedImage: selectedImage,
        },
      };

      const result = await dispatch(makeRequisition(request)).unwrap();

      if (result.requisitioncode) {
        // Navigate to details page
        navigate(`/requisitions/${result.requisitioncode}`);
      }
    } catch (error) {
      console.error('Failed to create requisition:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedOrganization('');
    setSelectedFromStore(null);
    setSelectedToStore(null);
    setDescription('');
    setPersonSearch('');
    setSelectedPerson(null);
    setPartSearch('');
    setSelectedPart(null);
    setQuantity('');
    setSelectedImage(null);
    setErrors({});
    dispatch(resetPerson());
    dispatch(resetPart());
    dispatch(resetMakeRequisition());
  };

  // Check if step is enabled
  const isStepEnabled = (step: number): boolean => {
    switch (step) {
      case 1: return !!selectedOrganization;
      case 2: return !!selectedOrganization && !!selectedFromStore && !!selectedToStore;
      case 3: return !!selectedOrganization && !!selectedFromStore && !!selectedToStore && !!description.trim();
      case 4: return !!selectedOrganization && !!selectedFromStore && !!selectedToStore && !!description.trim() && !!selectedPerson;
      case 5: return !!selectedOrganization && !!selectedFromStore && !!selectedToStore && !!description.trim() && !!selectedPerson && !!selectedPart;
      default: return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Requisition</h1>
          <p className="text-muted-foreground mt-1">Request parts and materials transfer</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/requisitions')}>
          Back to Requisitions
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
        <div className={`flex items-center space-x-2 ${selectedOrganization ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            selectedOrganization ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            1
          </div>
          <span className="text-sm">Organization</span>
        </div>
        <div className={`flex items-center space-x-2 ${isStepEnabled(2) ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isStepEnabled(2) ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            2
          </div>
          <span className="text-sm">Stores</span>
        </div>
        <div className={`flex items-center space-x-2 ${isStepEnabled(3) ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isStepEnabled(3) ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            3
          </div>
          <span className="text-sm">Details</span>
        </div>
        <div className={`flex items-center space-x-2 ${isStepEnabled(4) ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isStepEnabled(4) ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            4
          </div>
          <span className="text-sm">Part & Quantity</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Step 1: Organization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organization">Select Organization</Label>
                <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.value} value={org.value}>
                        {org.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.organization && (
                  <p className="text-sm text-destructive">{errors.organization}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Stores */}
          {selectedOrganization && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5" />
                  Store Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromStore">From Store</Label>
                    <Select
                      value={selectedFromStore?.STR_CODE || ''}
                      onValueChange={(value) => {
                        const store = fromStores.find(s => s.STR_CODE === value);
                        setSelectedFromStore(store || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select from store" />
                      </SelectTrigger>
                      <SelectContent>
                        {fromStores.map((store) => (
                          <SelectItem key={store.STR_CODE} value={store.STR_CODE}>
                            {store.STR_CODE} - {store.STR_DESC}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.fromStore && (
                      <p className="text-sm text-destructive">{errors.fromStore}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="toStore">To Store</Label>
                    <Select
                      value={selectedToStore?.STR_CODE || ''}
                      onValueChange={(value) => {
                        const store = toStores.find(s => s.STR_CODE === value);
                        setSelectedToStore(store || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select to store" />
                      </SelectTrigger>
                      <SelectContent>
                        {toStores.map((store) => (
                          <SelectItem key={store.STR_CODE} value={store.STR_CODE}>
                            {store.STR_CODE} - {store.STR_DESC}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.toStore && (
                      <p className="text-sm text-destructive">{errors.toStore}</p>
                    )}
                  </div>
                </div>
                {errors.stores && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.stores}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Description */}
          {isStepEnabled(2) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="description">Request Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the reason for this requisition..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Step 4: Requested By */}
          {isStepEnabled(3) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Requested By
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="personSearch">Requested By</Label>
                  <Popover open={personDropdownOpen} onOpenChange={setPersonDropdownOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={personDropdownOpen}
                        className="w-full justify-between"
                      >
                        {selectedPerson
                          ? `${selectedPerson.PER_CODE} - ${selectedPerson.PER_DESC}`
                          : "Search and select a person..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search person..."
                          value={personSearch}
                          onValueChange={(value) => {
                            setPersonSearch(value);
                            handlePersonSearch(value);
                          }}
                        />
                        <CommandList>
                          <CommandEmpty>No person found.</CommandEmpty>
                          <CommandGroup>
                            {personResults.map((person) => (
                              <CommandItem
                                key={person.PER_CODE}
                                value={`${person.PER_CODE} ${person.PER_DESC}`}
                                onSelect={() => {
                                  setSelectedPerson(person);
                                  setPersonDropdownOpen(false);
                                  setPersonSearch('');
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    selectedPerson?.PER_CODE === person.PER_CODE ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{person.PER_CODE}</span>
                                  <span className="text-sm text-muted-foreground">{person.PER_DESC}</span>
                                  {person.PER_TRADE && (
                                    <span className="text-xs text-muted-foreground">{person.PER_TRADE}</span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {selectedPerson && (
                  <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-medium">Selected: {selectedPerson.PER_DESC}</div>
                      <div className="text-sm text-muted-foreground">Code: {selectedPerson.PER_CODE}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPerson(null);
                        setPersonSearch('');
                        setPersonDropdownOpen(false);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {errors.person && (
                  <p className="text-sm text-destructive">{errors.person}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Part Selection */}
          {isStepEnabled(4) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Part Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="partSearch">Part</Label>
                  <Popover open={partDropdownOpen} onOpenChange={setPartDropdownOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={partDropdownOpen}
                        className="w-full justify-between"
                        disabled={!selectedFromStore}
                      >
                        {selectedPart
                          ? `${selectedPart.PAR_CODE} - ${selectedPart.PAR_DESC}`
                          : "Search and select a part..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search part..."
                          value={partSearch}
                          onValueChange={(value) => {
                            setPartSearch(value);
                            handlePartSearch(value);
                          }}
                        />
                        <CommandList>
                          <CommandEmpty>No part found.</CommandEmpty>
                          <CommandGroup>
                            {partResults.map((part) => (
                              <CommandItem
                                key={part.PAR_CODE}
                                value={`${part.PAR_CODE} ${part.PAR_DESC}`}
                                onSelect={() => {
                                  setSelectedPart(part);
                                  setPartDropdownOpen(false);
                                  setPartSearch('');
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    selectedPart?.PAR_CODE === part.PAR_CODE ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{part.PAR_CODE}</span>
                                  <span className="text-sm text-muted-foreground">{part.PAR_DESC}</span>
                                  <span className="text-xs text-muted-foreground">Available: {part.BIS_QTY}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {!selectedFromStore && (
                    <p className="text-sm text-muted-foreground">Please select a "From Store" first</p>
                  )}
                </div>

                {selectedPart && (
                  <div className="space-y-4">
                    <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-medium">Selected: {selectedPart.PAR_DESC}</div>
                        <div className="text-sm text-muted-foreground">Code: {selectedPart.PAR_CODE}</div>
                        <Badge variant="outline" className="mt-1">
                          Available: {selectedPart.BIS_QTY}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPart(null);
                          setPartSearch('');
                          setPartDropdownOpen(false);
                          setQuantity('');
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="Enter quantity"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        min="1"
                        max={selectedPart?.BIS_QTY}
                      />
                      {errors.quantity && (
                        <p className="text-sm text-destructive">{errors.quantity}</p>
                      )}
                    </div>
                  </div>
                )}

                {errors.part && (
                  <p className="text-sm text-destructive">{errors.part}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 6: Image Upload */}
          {isStepEnabled(5) && (
            <Card>
              <CardHeader>
                <CardTitle>Image Upload (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onImageSelect={setSelectedImage}
                  selectedImage={selectedImage}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Submit Section */}
      {isStepEnabled(5) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {requisitionState.makeRequisitionIsDone === true && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>Requisition created successfully!</span>
                  </div>
                )}
                {requisitionState.makeRequisitionIsDone === false && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-5 h-5" />
                    <span>Failed to create requisition</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={resetForm}>
                  Reset Form
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={requisitionState.makeRequisitionLoading}
                  className="min-w-32"
                >
                  {requisitionState.makeRequisitionLoading ? 'Creating...' : 'Create Requisition'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
