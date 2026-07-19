export const manifest = {
  "schemaVersion": "architecture-manifest-v0.4",
  "build": {
    "generator": "architecture-manifest-builder-v0.4.6",
    "inputDigests": {
      "references/bibliography.yaml": "abe9226586bfb64261c81b7756b7275c48a3a172a9a18b5f91f7acfd3145e374",
      "architectures/alphafold2.yaml": "23c41cc0dacde426b7981272401e113f6d713b1868844135d9a2dab5bb6f00bc",
      "views/alphafold2-semantic-zoom.view.yaml": "6b317c6d224a7e3b8416839247c0c12d6b9e0cd34d859475f4529a939d51fe8e",
      "pseudocode/alphafold2.yaml": "dc6534469437eba99e292899d31f28860a89f091d9457288e7d927af66598fac"
    }
  },
  "architecture": {
    "schemaVersion": "architecture-v0.4",
    "id": "alphafold2",
    "name": "AlphaFold 2 Monomer Network",
    "family": "protein_structure_prediction",
    "status": "draft",
    "taskModes": [
      "monomer_structure_prediction"
    ],
    "referenceConfiguration": {
      "visual_basis": "nature_figure_1e",
      "evoformer_blocks": 48,
      "structure_module_blocks": 8,
      "network_executions": 4,
      "recycling_feedback_passes": 3,
      "evidence": {
        "status": "confirmed_from_paper",
        "refs": [
          {
            "source_ref": "af2_2021",
            "role": "architecture_evidence",
            "locator": "Figure 1e and the AlphaFold network section"
          },
          {
            "source_ref": "af2_2021_supplement",
            "role": "configuration_evidence",
            "locator": "Supplementary Methods 1.4, 1.6, 1.8, and 1.10; Algorithms 2, 6, 20, and 30-32"
          }
        ]
      }
    },
    "sourceYaml": "../../architectures/alphafold2.yaml",
    "sources": [
      {
        "source_ref": "af2_2021",
        "role": "architecture_description"
      },
      {
        "source_ref": "af2_2021_supplement",
        "role": "detailed_architecture_description"
      },
      {
        "source_ref": "af2_data_pipeline_code",
        "role": "feature_pipeline_implementation"
      },
      {
        "source_ref": "af2_model_code",
        "role": "monomer_model_implementation"
      },
      {
        "source_ref": "af2_structure_code",
        "role": "structure_module_implementation"
      },
      {
        "source_ref": "af2_config_code",
        "role": "reference_configuration"
      }
    ],
    "decomposition": {
      "status": "complete",
      "evidence": {
        "status": "confirmed_from_paper",
        "refs": [
          {
            "source_ref": "af2_2021",
            "role": "architecture_evidence",
            "locator": "Figure 1e and the AlphaFold network section",
            "note": "The root follows the paper's model-level information flow rather than the released command-line workflow."
          },
          {
            "source_ref": "af2_2021_supplement",
            "role": "detailed_architecture_evidence",
            "locator": "Supplementary Methods 1.4; Algorithm 2"
          }
        ]
      }
    },
    "coverage": {
      "method": "declared_decomposition_closure",
      "scopes": {
        "architecture": {
          "status": "complete",
          "depth": 0,
          "immediateModuleCount": 2,
          "immediateModuleRefs": [
            "modules.feature_preparation",
            "modules.alphafold_iteration"
          ]
        },
        "modules.feature_preparation": {
          "status": "complete",
          "depth": 1,
          "immediateModuleCount": 3,
          "immediateModuleRefs": [
            "modules.genetic_database_search",
            "modules.sequence_pairing",
            "modules.structure_database_search"
          ]
        },
        "modules.genetic_database_search": {
          "status": "partial",
          "reason": "Search tools, database-specific limits, deduplication, clustering, and extra-MSA processing are reserved for a later data-pipeline board.",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.sequence_pairing": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.structure_database_search": {
          "status": "partial",
          "reason": "Hit filtering, realignment, atom extraction, and template featurization are reserved for a later template-pipeline board.",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.alphafold_iteration": {
          "status": "complete",
          "depth": 1,
          "immediateModuleCount": 4,
          "immediateModuleRefs": [
            "modules.input_embedder",
            "modules.evoformer_stack",
            "modules.structure_module",
            "modules.recycling_embedder"
          ]
        },
        "modules.input_embedder": {
          "status": "partial",
          "reason": "Template pair attention, template-angle concatenation, extra-MSA processing, and the exact recycling additions will be expanded on child boards.",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.evoformer_stack": {
          "status": "partial",
          "reason": "The two-tower Evoformer block internals and their bidirectional MSA-pair communication are reserved for the next architecture level.",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.structure_module": {
          "status": "partial",
          "reason": "Invariant point attention, rigid-frame updates, torsion prediction, and atom reconstruction are reserved for the structure-module board.",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.recycling_embedder": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        }
      },
      "summary": {
        "scopeCount": 10,
        "expandedScopeCount": 3,
        "completeExpandedScopeCount": 3,
        "partialScopeCount": 5,
        "leafFrontierCount": 2,
        "opaqueFrontierCount": 0,
        "partialFrontierCount": 5,
        "maximumAuthoredDepth": 2
      },
      "opaqueFrontierRefs": [

      ],
      "partialScopeRefs": [
        "modules.genetic_database_search",
        "modules.structure_database_search",
        "modules.input_embedder",
        "modules.evoformer_stack",
        "modules.structure_module"
      ]
    },
    "modules": [
      {
        "id": "feature_preparation",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "complete"
        },
        "label": "Sequence, MSA, and Template Preparation",
        "kind": "adapter",
        "mechanisms": [
          "genetic_database_search",
          "target_pairing",
          "structure_database_search"
        ],
        "role": "derive the three paper-level input branches from the target amino-acid sequence",
        "scale": "mixed",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; MSA input branch"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "data_pipeline_evidence",
              "locator": "Supplementary Methods 1.2.2, 1.2.7, and 1.2.9"
            }
          ]
        }
      },
      {
        "id": "genetic_database_search",
        "parent_ref": "modules.feature_preparation",
        "decomposition": {
          "status": "partial",
          "reason": "Search tools, database-specific limits, deduplication, clustering, and extra-MSA processing are reserved for a later data-pipeline board."
        },
        "label": "Genetic Database Search",
        "kind": "adapter",
        "mechanisms": [
          "jackhmmer_search",
          "hhblits_search",
          "msa_deduplication"
        ],
        "role": "search sequence databases and assemble homologous sequences aligned to the target",
        "scale": "msa",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; MSA input branch"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "data_pipeline_evidence",
              "locator": "Supplementary Methods 1.2.2, 1.2.7, and 1.2.9"
            }
          ]
        }
      },
      {
        "id": "sequence_pairing",
        "parent_ref": "modules.feature_preparation",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Target Pairing",
        "kind": "adapter",
        "mechanisms": [
          "outer_sum",
          "relative_position_encoding"
        ],
        "role": "turn target residue features and relative residue indices into the initial pairwise seed",
        "scale": "pair",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Pairing branch and pair representation"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "embedding_evidence",
              "locator": "Supplementary Methods 1.5; Algorithms 3-4"
            }
          ]
        }
      },
      {
        "id": "structure_database_search",
        "parent_ref": "modules.feature_preparation",
        "decomposition": {
          "status": "partial",
          "reason": "Hit filtering, realignment, atom extraction, and template featurization are reserved for a later template-pipeline board."
        },
        "label": "Structure Database Search",
        "kind": "adapter",
        "mechanisms": [
          "hhsearch",
          "template_hit_featurization"
        ],
        "role": "retrieve structural homologues and encode their sequence, torsion, mask, and pair-geometry features",
        "scale": "template",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; MSA input branch"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "data_pipeline_evidence",
              "locator": "Supplementary Methods 1.2.2, 1.2.7, and 1.2.9"
            }
          ]
        }
      },
      {
        "id": "alphafold_iteration",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "complete"
        },
        "label": "Shared-Weight AlphaFold Iteration",
        "kind": "controller",
        "mechanisms": [
          "recycling",
          "shared_weights"
        ],
        "role": "embed prepared inputs, jointly refine MSA and pair state, predict structure and confidence, and prepare feedback for the next execution",
        "scale": "mixed",
        "repeats": 4,
        "pseudocode_ref": "../../pseudocode/alphafold2.yaml",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the AlphaFold network section",
              "note": "The root follows the paper's model-level information flow rather than the released command-line workflow."
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "detailed_architecture_evidence",
              "locator": "Supplementary Methods 1.4; Algorithm 2"
            }
          ]
        }
      },
      {
        "id": "input_embedder",
        "parent_ref": "modules.alphafold_iteration",
        "decomposition": {
          "status": "partial",
          "reason": "Template pair attention, template-angle concatenation, extra-MSA processing, and the exact recycling additions will be expanded on child boards."
        },
        "label": "Input Embedding and Integration",
        "kind": "adapter",
        "mechanisms": [
          "msa_embedding",
          "pair_embedding",
          "template_integration",
          "extra_msa_stack",
          "recycled_state_injection"
        ],
        "role": "initialize MSA and pair representations from target, alignment, template, relative-position, extra-MSA, and recycled features",
        "scale": "mixed",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Pairing branch and pair representation"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "embedding_evidence",
              "locator": "Supplementary Methods 1.5; Algorithms 3-4"
            }
          ]
        }
      },
      {
        "id": "evoformer_stack",
        "parent_ref": "modules.alphafold_iteration",
        "decomposition": {
          "status": "partial",
          "reason": "The two-tower Evoformer block internals and their bidirectional MSA-pair communication are reserved for the next architecture level."
        },
        "label": "Evoformer Stack",
        "kind": "refiner",
        "mechanisms": [
          "msa_attention",
          "pair_biased_attention",
          "outer_product_mean",
          "triangle_multiplication",
          "triangle_attention"
        ],
        "role": "jointly refine MSA and residue-pair representations through 48 repeated blocks and project the final target row to a single representation",
        "scale": "mixed",
        "repeats": 48,
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the Evoformer section"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "evoformer_evidence",
              "locator": "Supplementary Methods 1.6; Algorithm 6"
            }
          ]
        }
      },
      {
        "id": "structure_module",
        "parent_ref": "modules.alphafold_iteration",
        "decomposition": {
          "status": "partial",
          "reason": "Invariant point attention, rigid-frame updates, torsion prediction, and atom reconstruction are reserved for the structure-module board."
        },
        "label": "Structure Module",
        "kind": "decoder",
        "mechanisms": [
          "invariant_point_attention",
          "rigid_frame_refinement",
          "torsion_angle_prediction",
          "all_atom_reconstruction",
          "confidence_prediction"
        ],
        "role": "refine per-residue frames for eight blocks and decode all-heavy-atom coordinates with per-residue confidence",
        "scale": "atom",
        "repeats": 8,
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the end-to-end structure prediction section"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "structure_evidence",
              "locator": "Supplementary Methods 1.8 and 1.9.6; Algorithms 20, 24, and 29"
            }
          ]
        }
      },
      {
        "id": "recycling_embedder",
        "parent_ref": "modules.alphafold_iteration",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Recycling Embedder",
        "kind": "adapter",
        "mechanisms": [
          "layer_normalization",
          "pseudo_beta_distance_binning",
          "additive_injection"
        ],
        "role": "normalize the previous MSA row and pair state, embed previous pseudo-beta distances, and form additive inputs for the next shared-weight execution",
        "scale": "mixed",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      }
    ],
    "blockInstances": [

    ],
    "representations": [
      {
        "id": "amino_acid_sequence",
        "scale": "residue",
        "semantic_role": "primary sequence whose monomer structure is predicted",
        "shape": "N_res residues",
        "glyph": "vector",
        "carries": [
          "ordered amino-acid identities",
          "residue indices"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the AlphaFold network section",
              "note": "The root follows the paper's model-level information flow rather than the released command-line workflow."
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "detailed_architecture_evidence",
              "locator": "Supplementary Methods 1.4; Algorithm 2"
            }
          ]
        }
      },
      {
        "id": "msa_features",
        "scale": "msa",
        "semantic_role": "homologous sequences aligned to the target sequence",
        "shape": "N_seq x N_res aligned residues and deletion features",
        "glyph": "matrix",
        "carries": [
          "target and homologous residue identities",
          "deletion indicators and counts",
          "evolutionary variation across aligned sequences"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; MSA input branch"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "data_pipeline_evidence",
              "locator": "Supplementary Methods 1.2.2, 1.2.7, and 1.2.9"
            }
          ]
        }
      },
      {
        "id": "target_pair_features",
        "scale": "pair",
        "semantic_role": "target-sequence pair seed used to initialize residue-pair reasoning",
        "shape": "N_res x N_res x f_pair",
        "glyph": "pair",
        "carries": [
          "ordered residue-pair target features",
          "clipped relative residue positions"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Pairing branch and pair representation"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "embedding_evidence",
              "locator": "Supplementary Methods 1.5; Algorithms 3-4"
            }
          ]
        }
      },
      {
        "id": "template_features",
        "scale": "template",
        "semantic_role": "sequence and pair geometry features derived from structural template hits",
        "shape": "N_templ x N_res x N_res x f_template",
        "glyph": "volume",
        "carries": [
          "template residue identities and torsion features",
          "template residue-pair geometry",
          "template masks"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; MSA input branch"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "data_pipeline_evidence",
              "locator": "Supplementary Methods 1.2.2, 1.2.7, and 1.2.9"
            }
          ]
        }
      },
      {
        "id": "msa_representation",
        "scale": "msa",
        "semantic_role": "learned MSA state refined jointly with residue-pair state",
        "shape": "N_seq x N_res x 256",
        "glyph": "matrix",
        "carries": [
          "learned evolutionary and sequence context",
          "target-row information shared with structure prediction"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Pairing branch and pair representation"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "embedding_evidence",
              "locator": "Supplementary Methods 1.5; Algorithms 3-4"
            }
          ]
        }
      },
      {
        "id": "pair_representation",
        "scale": "pair",
        "semantic_role": "learned directed residue-pair state used for geometric reasoning",
        "shape": "N_res x N_res x 128",
        "glyph": "pair",
        "carries": [
          "residue-pair relationships",
          "template and evolutionary constraints",
          "implicit geometric hypotheses"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Pairing branch and pair representation"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "embedding_evidence",
              "locator": "Supplementary Methods 1.5; Algorithms 3-4"
            }
          ]
        }
      },
      {
        "id": "single_representation",
        "scale": "residue",
        "semantic_role": "per-residue state projected from the final target row of the MSA representation",
        "shape": "N_res x 384",
        "glyph": "single",
        "carries": [
          "per-residue context for equivariant structure refinement"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the Evoformer section"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "evoformer_evidence",
              "locator": "Supplementary Methods 1.6; Algorithm 6"
            }
          ]
        }
      },
      {
        "id": "structure_prediction",
        "scale": "atom",
        "semantic_role": "predicted all-heavy-atom monomer structure with per-residue confidence",
        "shape": "N_res x 37 x 3 coordinates plus N_res pLDDT",
        "glyph": "coordinates",
        "carries": [
          "all-heavy-atom coordinates",
          "per-residue pLDDT confidence"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the end-to-end structure prediction section"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "structure_evidence",
              "locator": "Supplementary Methods 1.8 and 1.9.6; Algorithms 20, 24, and 29"
            }
          ]
        }
      },
      {
        "id": "msa_first_row",
        "scale": "residue",
        "semantic_role": "target-sequence row retained from the final MSA representation for recycling",
        "shape": "N_res x 256",
        "glyph": "single",
        "carries": [
          "final target-row Evoformer state"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "pseudo_beta_coordinates",
        "scale": "residue",
        "semantic_role": "pseudo-beta coordinates retained from the predicted structure for recycling",
        "shape": "N_res x 3",
        "glyph": "coordinates",
        "carries": [
          "beta-carbon coordinates",
          "alpha-carbon coordinates for glycine"
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      }
    ],
    "valueSites": [
      {
        "id": "input_sequence",
        "representation_ref": "representations.amino_acid_sequence",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "task_input",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the AlphaFold network section",
              "note": "The root follows the paper's model-level information flow rather than the released command-line workflow."
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "detailed_architecture_evidence",
              "locator": "Supplementary Methods 1.4; Algorithm 2"
            }
          ]
        }
      },
      {
        "id": "multiple_sequence_alignment",
        "representation_ref": "representations.msa_features",
        "scope_ref": "modules.feature_preparation",
        "role": "searched_and_deduplicated_alignment",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; MSA input branch"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "data_pipeline_evidence",
              "locator": "Supplementary Methods 1.2.2, 1.2.7, and 1.2.9"
            }
          ]
        }
      },
      {
        "id": "target_pair_features",
        "representation_ref": "representations.target_pair_features",
        "scope_ref": "modules.feature_preparation",
        "role": "target_pair_seed",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Pairing branch and pair representation"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "embedding_evidence",
              "locator": "Supplementary Methods 1.5; Algorithms 3-4"
            }
          ]
        }
      },
      {
        "id": "structural_templates",
        "representation_ref": "representations.template_features",
        "scope_ref": "modules.feature_preparation",
        "role": "searched_template_features",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; MSA input branch"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "data_pipeline_evidence",
              "locator": "Supplementary Methods 1.2.2, 1.2.7, and 1.2.9"
            }
          ]
        }
      },
      {
        "id": "msa_representation_before_evoformer",
        "representation_ref": "representations.msa_representation",
        "scope_ref": "modules.alphafold_iteration",
        "role": "initial_msa_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Pairing branch and pair representation"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "embedding_evidence",
              "locator": "Supplementary Methods 1.5; Algorithms 3-4"
            }
          ]
        }
      },
      {
        "id": "pair_representation_before_evoformer",
        "representation_ref": "representations.pair_representation",
        "scope_ref": "modules.alphafold_iteration",
        "role": "initial_pair_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Pairing branch and pair representation"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "embedding_evidence",
              "locator": "Supplementary Methods 1.5; Algorithms 3-4"
            }
          ]
        }
      },
      {
        "id": "msa_representation_after_evoformer",
        "representation_ref": "representations.msa_representation",
        "scope_ref": "modules.alphafold_iteration",
        "role": "processed_msa_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the Evoformer section"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "evoformer_evidence",
              "locator": "Supplementary Methods 1.6; Algorithm 6"
            }
          ]
        }
      },
      {
        "id": "single_representation_after_evoformer",
        "representation_ref": "representations.single_representation",
        "scope_ref": "modules.alphafold_iteration",
        "role": "structure_module_single_input",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the Evoformer section"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "evoformer_evidence",
              "locator": "Supplementary Methods 1.6; Algorithm 6"
            }
          ]
        }
      },
      {
        "id": "pair_representation_after_evoformer",
        "representation_ref": "representations.pair_representation",
        "scope_ref": "modules.alphafold_iteration",
        "role": "processed_pair_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the Evoformer section"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "evoformer_evidence",
              "locator": "Supplementary Methods 1.6; Algorithm 6"
            }
          ]
        }
      },
      {
        "id": "predicted_structure_output",
        "representation_ref": "representations.structure_prediction",
        "scope_ref": "architecture",
        "boundary": "output",
        "role": "task_output",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the end-to-end structure prediction section"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "structure_evidence",
              "locator": "Supplementary Methods 1.8 and 1.9.6; Algorithms 20, 24, and 29"
            }
          ]
        }
      },
      {
        "id": "recycled_msa_after_iteration",
        "representation_ref": "representations.msa_first_row",
        "scope_ref": "modules.alphafold_iteration",
        "role": "recycle_state_after_iteration",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "recycled_msa_before_iteration",
        "representation_ref": "representations.msa_first_row",
        "scope_ref": "modules.alphafold_iteration",
        "role": "recycle_state_before_iteration",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "recycled_pair_after_iteration",
        "representation_ref": "representations.pair_representation",
        "scope_ref": "modules.alphafold_iteration",
        "role": "recycle_state_after_iteration",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "recycled_pair_before_iteration",
        "representation_ref": "representations.pair_representation",
        "scope_ref": "modules.alphafold_iteration",
        "role": "recycle_state_before_iteration",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "recycled_coordinates_after_iteration",
        "representation_ref": "representations.pseudo_beta_coordinates",
        "scope_ref": "modules.alphafold_iteration",
        "role": "recycle_state_after_iteration",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "recycled_coordinates_before_iteration",
        "representation_ref": "representations.pseudo_beta_coordinates",
        "scope_ref": "modules.alphafold_iteration",
        "role": "recycle_state_before_iteration",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "msa_recycle_update",
        "representation_ref": "representations.msa_first_row",
        "scope_ref": "modules.alphafold_iteration",
        "role": "additive_update_for_next_msa_input",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "pair_recycle_update",
        "representation_ref": "representations.pair_representation",
        "scope_ref": "modules.alphafold_iteration",
        "role": "additive_update_for_next_pair_input",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      }
    ],
    "valueSiteInterfaces": {
      "input_sequence": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.input_sequence_queries_genetic_database",
          "relations.input_sequence_enters_pairing",
          "relations.input_sequence_queries_structure_database"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.genetic_database_search",
          "modules.sequence_pairing",
          "modules.structure_database_search"
        ]
      },
      "multiple_sequence_alignment": {
        "incomingRelationRefs": [
          "relations.genetic_search_produces_msa"
        ],
        "outgoingRelationRefs": [
          "relations.msa_features_enter_input_embedder"
        ],
        "producerRefs": [
          "modules.genetic_database_search"
        ],
        "consumerRefs": [
          "modules.input_embedder"
        ]
      },
      "target_pair_features": {
        "incomingRelationRefs": [
          "relations.sequence_pairing_produces_target_pair_features"
        ],
        "outgoingRelationRefs": [
          "relations.target_pair_features_enter_input_embedder"
        ],
        "producerRefs": [
          "modules.sequence_pairing"
        ],
        "consumerRefs": [
          "modules.input_embedder"
        ]
      },
      "structural_templates": {
        "incomingRelationRefs": [
          "relations.structure_search_produces_templates"
        ],
        "outgoingRelationRefs": [
          "relations.templates_enter_input_embedder"
        ],
        "producerRefs": [
          "modules.structure_database_search"
        ],
        "consumerRefs": [
          "modules.input_embedder"
        ]
      },
      "msa_representation_before_evoformer": {
        "incomingRelationRefs": [
          "relations.input_embedder_initializes_msa_representation"
        ],
        "outgoingRelationRefs": [
          "relations.initial_msa_enters_evoformer"
        ],
        "producerRefs": [
          "modules.input_embedder"
        ],
        "consumerRefs": [
          "modules.evoformer_stack"
        ]
      },
      "pair_representation_before_evoformer": {
        "incomingRelationRefs": [
          "relations.input_embedder_initializes_pair_representation"
        ],
        "outgoingRelationRefs": [
          "relations.initial_pair_enters_evoformer"
        ],
        "producerRefs": [
          "modules.input_embedder"
        ],
        "consumerRefs": [
          "modules.evoformer_stack"
        ]
      },
      "msa_representation_after_evoformer": {
        "incomingRelationRefs": [
          "relations.evoformer_produces_processed_msa"
        ],
        "outgoingRelationRefs": [
          "relations.processed_msa_supplies_recycled_first_row"
        ],
        "producerRefs": [
          "modules.evoformer_stack"
        ],
        "consumerRefs": [
          "value_sites.recycled_msa_after_iteration"
        ]
      },
      "single_representation_after_evoformer": {
        "incomingRelationRefs": [
          "relations.evoformer_projects_single_representation"
        ],
        "outgoingRelationRefs": [
          "relations.single_representation_enters_structure_module"
        ],
        "producerRefs": [
          "modules.evoformer_stack"
        ],
        "consumerRefs": [
          "modules.structure_module"
        ]
      },
      "pair_representation_after_evoformer": {
        "incomingRelationRefs": [
          "relations.evoformer_produces_processed_pair"
        ],
        "outgoingRelationRefs": [
          "relations.pair_representation_enters_structure_module",
          "relations.processed_pair_supplies_recycled_pair"
        ],
        "producerRefs": [
          "modules.evoformer_stack"
        ],
        "consumerRefs": [
          "modules.structure_module",
          "value_sites.recycled_pair_after_iteration"
        ]
      },
      "predicted_structure_output": {
        "incomingRelationRefs": [
          "relations.structure_module_predicts_structure_and_confidence"
        ],
        "outgoingRelationRefs": [
          "relations.predicted_structure_supplies_recycled_coordinates"
        ],
        "producerRefs": [
          "modules.structure_module"
        ],
        "consumerRefs": [
          "value_sites.recycled_coordinates_after_iteration"
        ]
      },
      "recycled_msa_after_iteration": {
        "incomingRelationRefs": [
          "relations.processed_msa_supplies_recycled_first_row"
        ],
        "outgoingRelationRefs": [
          "relations.recycled_msa_advances_to_next_iteration"
        ],
        "producerRefs": [
          "value_sites.msa_representation_after_evoformer"
        ],
        "consumerRefs": [
          "value_sites.recycled_msa_before_iteration"
        ]
      },
      "recycled_msa_before_iteration": {
        "incomingRelationRefs": [
          "relations.recycled_msa_advances_to_next_iteration"
        ],
        "outgoingRelationRefs": [
          "relations.recycled_msa_enters_recycling_embedder"
        ],
        "producerRefs": [
          "value_sites.recycled_msa_after_iteration"
        ],
        "consumerRefs": [
          "modules.recycling_embedder"
        ]
      },
      "recycled_pair_after_iteration": {
        "incomingRelationRefs": [
          "relations.processed_pair_supplies_recycled_pair"
        ],
        "outgoingRelationRefs": [
          "relations.recycled_pair_advances_to_next_iteration"
        ],
        "producerRefs": [
          "value_sites.pair_representation_after_evoformer"
        ],
        "consumerRefs": [
          "value_sites.recycled_pair_before_iteration"
        ]
      },
      "recycled_pair_before_iteration": {
        "incomingRelationRefs": [
          "relations.recycled_pair_advances_to_next_iteration"
        ],
        "outgoingRelationRefs": [
          "relations.recycled_pair_enters_recycling_embedder"
        ],
        "producerRefs": [
          "value_sites.recycled_pair_after_iteration"
        ],
        "consumerRefs": [
          "modules.recycling_embedder"
        ]
      },
      "recycled_coordinates_after_iteration": {
        "incomingRelationRefs": [
          "relations.predicted_structure_supplies_recycled_coordinates"
        ],
        "outgoingRelationRefs": [
          "relations.recycled_coordinates_advance_to_next_iteration"
        ],
        "producerRefs": [
          "value_sites.predicted_structure_output"
        ],
        "consumerRefs": [
          "value_sites.recycled_coordinates_before_iteration"
        ]
      },
      "recycled_coordinates_before_iteration": {
        "incomingRelationRefs": [
          "relations.recycled_coordinates_advance_to_next_iteration"
        ],
        "outgoingRelationRefs": [
          "relations.recycled_coordinates_enter_recycling_embedder"
        ],
        "producerRefs": [
          "value_sites.recycled_coordinates_after_iteration"
        ],
        "consumerRefs": [
          "modules.recycling_embedder"
        ]
      },
      "msa_recycle_update": {
        "incomingRelationRefs": [
          "relations.recycling_embedder_produces_msa_update"
        ],
        "outgoingRelationRefs": [
          "relations.msa_recycle_update_conditions_input_embedder"
        ],
        "producerRefs": [
          "modules.recycling_embedder"
        ],
        "consumerRefs": [
          "modules.input_embedder"
        ]
      },
      "pair_recycle_update": {
        "incomingRelationRefs": [
          "relations.recycling_embedder_produces_pair_update"
        ],
        "outgoingRelationRefs": [
          "relations.pair_recycle_update_conditions_input_embedder"
        ],
        "producerRefs": [
          "modules.recycling_embedder"
        ],
        "consumerRefs": [
          "modules.input_embedder"
        ]
      }
    },
    "execution": {
      "loops": [
        {
          "id": "recycling_loop",
          "repeats": 4,
          "reruns": [
            "modules.input_embedder",
            "modules.evoformer_stack",
            "modules.structure_module",
            "modules.recycling_embedder"
          ],
          "cached": [
            "value_sites.input_sequence",
            "value_sites.multiple_sequence_alignment",
            "value_sites.target_pair_features",
            "value_sites.structural_templates"
          ],
          "notes": [
            "Figure 1e's \"recycling (three times)\" means one initial execution followed by three shared-weight feedback executions.",
            "The first execution receives zero-valued recycled state.",
            "The final MSA first row, final pair representation, and predicted pseudo-beta coordinates form the feedback state."
          ],
          "evidence": {
            "status": "confirmed_from_paper",
            "refs": [
              {
                "source_ref": "af2_2021",
                "role": "architecture_evidence",
                "locator": "Figure 1e; Recycling (three times)"
              },
              {
                "source_ref": "af2_2021_supplement",
                "role": "execution_evidence",
                "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
              }
            ]
          }
        }
      ]
    },
    "stateSemantics": {
      "recycled_msa_first_row": {
        "representation_ref": "representations.msa_first_row",
        "value_site_refs": [
          "value_sites.recycled_msa_after_iteration",
          "value_sites.recycled_msa_before_iteration",
          "value_sites.msa_recycle_update"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "The final first row of the Evoformer MSA representation is normalized and added to the next iteration's first MSA row."
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      "recycled_pair_representation": {
        "representation_ref": "representations.pair_representation",
        "value_site_refs": [
          "value_sites.recycled_pair_after_iteration",
          "value_sites.recycled_pair_before_iteration",
          "value_sites.pair_recycle_update"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "The final Evoformer pair representation is normalized and combined with a binned-distance embedding of the previous structure."
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      "recycled_pseudo_beta_coordinates": {
        "representation_ref": "representations.pseudo_beta_coordinates",
        "value_site_refs": [
          "value_sites.recycled_coordinates_after_iteration",
          "value_sites.recycled_coordinates_before_iteration"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "Pseudo-beta coordinates, using alpha carbon for glycine, are converted to pairwise distance bins for the next pair update."
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      }
    },
    "stateSemanticsBySite": {
      "recycled_msa_after_iteration": {
        "representation_ref": "representations.msa_first_row",
        "value_site_refs": [
          "value_sites.recycled_msa_after_iteration",
          "value_sites.recycled_msa_before_iteration",
          "value_sites.msa_recycle_update"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "The final first row of the Evoformer MSA representation is normalized and added to the next iteration's first MSA row."
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        },
        "groupId": "recycled_msa_first_row"
      },
      "recycled_msa_before_iteration": {
        "representation_ref": "representations.msa_first_row",
        "value_site_refs": [
          "value_sites.recycled_msa_after_iteration",
          "value_sites.recycled_msa_before_iteration",
          "value_sites.msa_recycle_update"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "The final first row of the Evoformer MSA representation is normalized and added to the next iteration's first MSA row."
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        },
        "groupId": "recycled_msa_first_row"
      },
      "msa_recycle_update": {
        "representation_ref": "representations.msa_first_row",
        "value_site_refs": [
          "value_sites.recycled_msa_after_iteration",
          "value_sites.recycled_msa_before_iteration",
          "value_sites.msa_recycle_update"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "The final first row of the Evoformer MSA representation is normalized and added to the next iteration's first MSA row."
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        },
        "groupId": "recycled_msa_first_row"
      },
      "recycled_pair_after_iteration": {
        "representation_ref": "representations.pair_representation",
        "value_site_refs": [
          "value_sites.recycled_pair_after_iteration",
          "value_sites.recycled_pair_before_iteration",
          "value_sites.pair_recycle_update"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "The final Evoformer pair representation is normalized and combined with a binned-distance embedding of the previous structure."
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        },
        "groupId": "recycled_pair_representation"
      },
      "recycled_pair_before_iteration": {
        "representation_ref": "representations.pair_representation",
        "value_site_refs": [
          "value_sites.recycled_pair_after_iteration",
          "value_sites.recycled_pair_before_iteration",
          "value_sites.pair_recycle_update"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "The final Evoformer pair representation is normalized and combined with a binned-distance embedding of the previous structure."
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        },
        "groupId": "recycled_pair_representation"
      },
      "pair_recycle_update": {
        "representation_ref": "representations.pair_representation",
        "value_site_refs": [
          "value_sites.recycled_pair_after_iteration",
          "value_sites.recycled_pair_before_iteration",
          "value_sites.pair_recycle_update"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "The final Evoformer pair representation is normalized and combined with a binned-distance embedding of the previous structure."
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        },
        "groupId": "recycled_pair_representation"
      },
      "recycled_coordinates_after_iteration": {
        "representation_ref": "representations.pseudo_beta_coordinates",
        "value_site_refs": [
          "value_sites.recycled_coordinates_after_iteration",
          "value_sites.recycled_coordinates_before_iteration"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "Pseudo-beta coordinates, using alpha carbon for glycine, are converted to pairwise distance bins for the next pair update."
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        },
        "groupId": "recycled_pseudo_beta_coordinates"
      },
      "recycled_coordinates_before_iteration": {
        "representation_ref": "representations.pseudo_beta_coordinates",
        "value_site_refs": [
          "value_sites.recycled_coordinates_after_iteration",
          "value_sites.recycled_coordinates_before_iteration"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "Pseudo-beta coordinates, using alpha carbon for glycine, are converted to pairwise distance bins for the next pair update."
        ],
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        },
        "groupId": "recycled_pseudo_beta_coordinates"
      }
    },
    "conditioning": [
      {
        "id": "recycled_msa_additive_injection",
        "relation_ref": "relations.msa_recycle_update_conditions_input_embedder",
        "mode": "additive_injection",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        },
        "source": "value_sites.msa_recycle_update",
        "target": "modules.input_embedder"
      },
      {
        "id": "recycled_pair_additive_injection",
        "relation_ref": "relations.pair_recycle_update_conditions_input_embedder",
        "mode": "additive_injection",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        },
        "source": "value_sites.pair_recycle_update",
        "target": "modules.input_embedder"
      }
    ],
    "scaleTransitions": [
      {
        "id": "target_msa_row_selection",
        "relation_path": [
          "relations.processed_msa_supplies_recycled_first_row"
        ],
        "aggregation": "first_row_selection",
        "copy_vs_pool": "copy",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        },
        "source": "value_sites.msa_representation_after_evoformer",
        "target": "value_sites.recycled_msa_after_iteration",
        "from_scale": "msa",
        "to_scale": "residue",
        "projection_refs": [

        ]
      },
      {
        "id": "pseudo_beta_coordinates_to_pair_update",
        "relation_path": [
          "relations.recycled_coordinates_enter_recycling_embedder",
          "relations.recycling_embedder_produces_pair_update"
        ],
        "aggregation": "pairwise_distance_binning",
        "copy_vs_pool": "expand",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        },
        "source": "value_sites.recycled_coordinates_before_iteration",
        "target": "value_sites.pair_recycle_update",
        "from_scale": "residue",
        "to_scale": "pair",
        "projection_refs": [
          "modules.recycling_embedder"
        ]
      }
    ],
    "trainingInference": {
      "objective": {
        "kind": "composite_structure_and_auxiliary_losses",
        "notes": [
          "Structure prediction is trained with FAPE and auxiliary objectives, including confidence and masked-MSA prediction.",
          "Only the final randomly selected recycling iteration receives the training loss in the approximate recycling procedure."
        ]
      },
      "schedule": {
        "kind": "initial_training_then_fine_tuning"
      },
      "sampler": {
        "kind": "shared_weight_recycling_inference",
        "steps": 4,
        "configurable": true
      },
      "teacher_forcing": "none",
      "self_conditioning": "recycled_previous_outputs",
      "checkpoint_notes": [
        "This source set uses the paper's monomer network abstraction and its four total shared-weight executions.",
        "Released monomer presets may configure the same behavior as three recycles before the final prediction."
      ],
      "evidence": {
        "status": "confirmed_from_paper",
        "refs": [
          {
            "source_ref": "af2_2021_supplement",
            "role": "training_and_inference_evidence",
            "locator": "Supplementary Methods 1.9-1.11; Algorithms 2 and 30-32"
          }
        ]
      }
    },
    "relations": [
      {
        "id": "input_sequence_queries_genetic_database",
        "from": "value_sites.input_sequence",
        "to": "modules.genetic_database_search",
        "kind": "data_flow",
        "carries": [
          "representations.amino_acid_sequence"
        ],
        "operation": "search_sequence_databases",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; MSA input branch"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "data_pipeline_evidence",
              "locator": "Supplementary Methods 1.2.2, 1.2.7, and 1.2.9"
            }
          ]
        }
      },
      {
        "id": "genetic_search_produces_msa",
        "from": "modules.genetic_database_search",
        "to": "value_sites.multiple_sequence_alignment",
        "kind": "data_flow",
        "carries": [
          "representations.msa_features"
        ],
        "operation": "deduplicate_and_stack_alignments",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; MSA input branch"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "data_pipeline_evidence",
              "locator": "Supplementary Methods 1.2.2, 1.2.7, and 1.2.9"
            }
          ]
        }
      },
      {
        "id": "input_sequence_enters_pairing",
        "from": "value_sites.input_sequence",
        "to": "modules.sequence_pairing",
        "kind": "data_flow",
        "carries": [
          "representations.amino_acid_sequence"
        ],
        "operation": "build_target_pair_seed",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Pairing branch and pair representation"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "embedding_evidence",
              "locator": "Supplementary Methods 1.5; Algorithms 3-4"
            }
          ]
        }
      },
      {
        "id": "sequence_pairing_produces_target_pair_features",
        "from": "modules.sequence_pairing",
        "to": "value_sites.target_pair_features",
        "kind": "data_flow",
        "carries": [
          "representations.target_pair_features"
        ],
        "operation": "outer_sum_target_features_and_add_relative_positions",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Pairing branch and pair representation"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "embedding_evidence",
              "locator": "Supplementary Methods 1.5; Algorithms 3-4"
            }
          ]
        }
      },
      {
        "id": "input_sequence_queries_structure_database",
        "from": "value_sites.input_sequence",
        "to": "modules.structure_database_search",
        "kind": "data_flow",
        "carries": [
          "representations.amino_acid_sequence"
        ],
        "operation": "initiate_sequence_derived_template_search",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; MSA input branch"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "data_pipeline_evidence",
              "locator": "Supplementary Methods 1.2.2, 1.2.7, and 1.2.9"
            }
          ]
        }
      },
      {
        "id": "structure_search_produces_templates",
        "from": "modules.structure_database_search",
        "to": "value_sites.structural_templates",
        "kind": "data_flow",
        "carries": [
          "representations.template_features"
        ],
        "operation": "featurize_template_hits",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; MSA input branch"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "data_pipeline_evidence",
              "locator": "Supplementary Methods 1.2.2, 1.2.7, and 1.2.9"
            }
          ]
        }
      },
      {
        "id": "msa_features_enter_input_embedder",
        "from": "value_sites.multiple_sequence_alignment",
        "to": "modules.input_embedder",
        "kind": "data_flow",
        "carries": [
          "representations.msa_features"
        ],
        "operation": "embed_clustered_and_extra_msa_features",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Pairing branch and pair representation"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "embedding_evidence",
              "locator": "Supplementary Methods 1.5; Algorithms 3-4"
            }
          ]
        }
      },
      {
        "id": "target_pair_features_enter_input_embedder",
        "from": "value_sites.target_pair_features",
        "to": "modules.input_embedder",
        "kind": "data_flow",
        "carries": [
          "representations.target_pair_features"
        ],
        "operation": "initialize_pair_representation",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Pairing branch and pair representation"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "embedding_evidence",
              "locator": "Supplementary Methods 1.5; Algorithms 3-4"
            }
          ]
        }
      },
      {
        "id": "templates_enter_input_embedder",
        "from": "value_sites.structural_templates",
        "to": "modules.input_embedder",
        "kind": "conditioning",
        "carries": [
          "representations.template_features"
        ],
        "operation": "integrate_template_angle_and_pair_features",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Pairing branch and pair representation"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "embedding_evidence",
              "locator": "Supplementary Methods 1.5; Algorithms 3-4"
            }
          ]
        }
      },
      {
        "id": "input_embedder_initializes_msa_representation",
        "from": "modules.input_embedder",
        "to": "value_sites.msa_representation_before_evoformer",
        "kind": "data_flow",
        "carries": [
          "representations.msa_representation"
        ],
        "operation": "assemble_initial_msa_representation",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Pairing branch and pair representation"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "embedding_evidence",
              "locator": "Supplementary Methods 1.5; Algorithms 3-4"
            }
          ]
        }
      },
      {
        "id": "input_embedder_initializes_pair_representation",
        "from": "modules.input_embedder",
        "to": "value_sites.pair_representation_before_evoformer",
        "kind": "data_flow",
        "carries": [
          "representations.pair_representation"
        ],
        "operation": "assemble_initial_pair_representation",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Pairing branch and pair representation"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "embedding_evidence",
              "locator": "Supplementary Methods 1.5; Algorithms 3-4"
            }
          ]
        }
      },
      {
        "id": "initial_msa_enters_evoformer",
        "from": "value_sites.msa_representation_before_evoformer",
        "to": "modules.evoformer_stack",
        "kind": "data_flow",
        "carries": [
          "representations.msa_representation"
        ],
        "operation": "refine_msa_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the Evoformer section"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "evoformer_evidence",
              "locator": "Supplementary Methods 1.6; Algorithm 6"
            }
          ]
        }
      },
      {
        "id": "initial_pair_enters_evoformer",
        "from": "value_sites.pair_representation_before_evoformer",
        "to": "modules.evoformer_stack",
        "kind": "data_flow",
        "carries": [
          "representations.pair_representation"
        ],
        "operation": "refine_pair_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the Evoformer section"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "evoformer_evidence",
              "locator": "Supplementary Methods 1.6; Algorithm 6"
            }
          ]
        }
      },
      {
        "id": "evoformer_produces_processed_msa",
        "from": "modules.evoformer_stack",
        "to": "value_sites.msa_representation_after_evoformer",
        "kind": "data_flow",
        "carries": [
          "representations.msa_representation"
        ],
        "operation": "emit_final_msa_representation",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the Evoformer section"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "evoformer_evidence",
              "locator": "Supplementary Methods 1.6; Algorithm 6"
            }
          ]
        }
      },
      {
        "id": "evoformer_projects_single_representation",
        "from": "modules.evoformer_stack",
        "to": "value_sites.single_representation_after_evoformer",
        "kind": "data_flow",
        "carries": [
          "representations.single_representation"
        ],
        "operation": "project_final_target_row",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the Evoformer section"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "evoformer_evidence",
              "locator": "Supplementary Methods 1.6; Algorithm 6"
            }
          ]
        }
      },
      {
        "id": "evoformer_produces_processed_pair",
        "from": "modules.evoformer_stack",
        "to": "value_sites.pair_representation_after_evoformer",
        "kind": "data_flow",
        "carries": [
          "representations.pair_representation"
        ],
        "operation": "emit_final_pair_representation",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the Evoformer section"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "evoformer_evidence",
              "locator": "Supplementary Methods 1.6; Algorithm 6"
            }
          ]
        }
      },
      {
        "id": "single_representation_enters_structure_module",
        "from": "value_sites.single_representation_after_evoformer",
        "to": "modules.structure_module",
        "kind": "data_flow",
        "carries": [
          "representations.single_representation"
        ],
        "operation": "initialize_per_residue_structure_state",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the end-to-end structure prediction section"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "structure_evidence",
              "locator": "Supplementary Methods 1.8 and 1.9.6; Algorithms 20, 24, and 29"
            }
          ]
        }
      },
      {
        "id": "pair_representation_enters_structure_module",
        "from": "value_sites.pair_representation_after_evoformer",
        "to": "modules.structure_module",
        "kind": "conditioning",
        "carries": [
          "representations.pair_representation"
        ],
        "operation": "condition_invariant_point_attention",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the end-to-end structure prediction section"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "structure_evidence",
              "locator": "Supplementary Methods 1.8 and 1.9.6; Algorithms 20, 24, and 29"
            }
          ]
        }
      },
      {
        "id": "structure_module_predicts_structure_and_confidence",
        "from": "modules.structure_module",
        "to": "value_sites.predicted_structure_output",
        "kind": "data_flow",
        "carries": [
          "representations.structure_prediction"
        ],
        "operation": "decode_atom_coordinates_and_plddt",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the end-to-end structure prediction section"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "structure_evidence",
              "locator": "Supplementary Methods 1.8 and 1.9.6; Algorithms 20, 24, and 29"
            }
          ]
        }
      },
      {
        "id": "processed_msa_supplies_recycled_first_row",
        "from": "value_sites.msa_representation_after_evoformer",
        "to": "value_sites.recycled_msa_after_iteration",
        "kind": "state_update",
        "carries": [
          "representations.msa_first_row"
        ],
        "operation": "select_final_target_msa_row",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "processed_pair_supplies_recycled_pair",
        "from": "value_sites.pair_representation_after_evoformer",
        "to": "value_sites.recycled_pair_after_iteration",
        "kind": "state_update",
        "carries": [
          "representations.pair_representation"
        ],
        "operation": "retain_final_pair_representation",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "predicted_structure_supplies_recycled_coordinates",
        "from": "value_sites.predicted_structure_output",
        "to": "value_sites.recycled_coordinates_after_iteration",
        "kind": "state_update",
        "carries": [
          "representations.pseudo_beta_coordinates"
        ],
        "operation": "extract_pseudo_beta_coordinates",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "recycled_msa_advances_to_next_iteration",
        "from": "value_sites.recycled_msa_after_iteration",
        "to": "value_sites.recycled_msa_before_iteration",
        "kind": "state_update",
        "carries": [
          "representations.msa_first_row"
        ],
        "operation": "carry_msa_row_to_next_shared_weight_execution",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "recycled_pair_advances_to_next_iteration",
        "from": "value_sites.recycled_pair_after_iteration",
        "to": "value_sites.recycled_pair_before_iteration",
        "kind": "state_update",
        "carries": [
          "representations.pair_representation"
        ],
        "operation": "carry_pair_state_to_next_shared_weight_execution",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "recycled_coordinates_advance_to_next_iteration",
        "from": "value_sites.recycled_coordinates_after_iteration",
        "to": "value_sites.recycled_coordinates_before_iteration",
        "kind": "state_update",
        "carries": [
          "representations.pseudo_beta_coordinates"
        ],
        "operation": "carry_coordinates_to_next_shared_weight_execution",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "recycled_msa_enters_recycling_embedder",
        "from": "value_sites.recycled_msa_before_iteration",
        "to": "modules.recycling_embedder",
        "kind": "state_update",
        "carries": [
          "representations.msa_first_row"
        ],
        "operation": "normalize_recycled_msa_row",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "recycled_pair_enters_recycling_embedder",
        "from": "value_sites.recycled_pair_before_iteration",
        "to": "modules.recycling_embedder",
        "kind": "state_update",
        "carries": [
          "representations.pair_representation"
        ],
        "operation": "normalize_recycled_pair_representation",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "recycled_coordinates_enter_recycling_embedder",
        "from": "value_sites.recycled_coordinates_before_iteration",
        "to": "modules.recycling_embedder",
        "kind": "state_update",
        "carries": [
          "representations.pseudo_beta_coordinates"
        ],
        "operation": "bin_recycled_pseudo_beta_distances",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "recycling_embedder_produces_msa_update",
        "from": "modules.recycling_embedder",
        "to": "value_sites.msa_recycle_update",
        "kind": "conditioning",
        "carries": [
          "representations.msa_first_row"
        ],
        "operation": "produce_normalized_msa_update",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "recycling_embedder_produces_pair_update",
        "from": "modules.recycling_embedder",
        "to": "value_sites.pair_recycle_update",
        "kind": "conditioning",
        "carries": [
          "representations.pair_representation"
        ],
        "operation": "combine_normalized_pair_and_distance_embedding",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "msa_recycle_update_conditions_input_embedder",
        "from": "value_sites.msa_recycle_update",
        "to": "modules.input_embedder",
        "kind": "conditioning",
        "carries": [
          "representations.msa_first_row"
        ],
        "operation": "add_to_next_target_msa_row",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "pair_recycle_update_conditions_input_embedder",
        "from": "value_sites.pair_recycle_update",
        "to": "modules.input_embedder",
        "kind": "conditioning",
        "carries": [
          "representations.pair_representation"
        ],
        "operation": "add_to_next_pair_representation",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      }
    ],
    "claims": [
      {
        "id": "paper_root_has_two_learned_stages",
        "statement": "The paper-level AlphaFold network consists of a 48-block Evoformer trunk followed by an eight-block Structure Module.",
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e and the AlphaFold network section",
              "note": "The root follows the paper's model-level information flow rather than the released command-line workflow."
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "detailed_architecture_evidence",
              "locator": "Supplementary Methods 1.4; Algorithm 2"
            }
          ]
        }
      },
      {
        "id": "recycling_uses_msa_pair_and_geometry",
        "statement": "Recycling feeds back the final MSA first row, final pair representation, and predicted pseudo-beta geometry; the derived single representation is not itself recycled.",
        "scope": {
          "module_ref": "modules.recycling_embedder"
        },
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      },
      {
        "id": "three_recycles_mean_four_executions",
        "statement": "Figure 1e's three recycling feedback passes correspond to four total shared-weight network executions including the initial pass.",
        "scope": {
          "module_ref": "modules.alphafold_iteration"
        },
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_evidence",
              "locator": "Figure 1e; Recycling (three times)"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "execution_evidence",
              "locator": "Supplementary Methods 1.10; Algorithms 2 and 30-32"
            }
          ]
        }
      }
    ],
    "openQuestions": [
      {
        "id": "choose_first_internal_drilldown",
        "question": "Should the next authored child board expand the two-tower Evoformer block or the complete recycling iteration first?",
        "status": "deferred",
        "affected_refs": [
          "modules.evoformer_stack",
          "modules.alphafold_iteration"
        ],
        "blocking": false,
        "resolution_criteria": "Select the next board according to whether the immediate explanatory priority is learned representation exchange or whole-network iterative refinement.",
        "evidence": {
          "status": "open_question",
          "refs": [
            {
              "source_ref": "af2_2021",
              "role": "architecture_context",
              "locator": "Figures 1e and 3a"
            },
            {
              "source_ref": "af2_2021_supplement",
              "role": "architecture_context",
              "locator": "Supplementary Methods 1.6 and 1.10"
            }
          ]
        }
      }
    ]
  },
  "bibliography": {
    "schemaVersion": "bibliography-v0.1",
    "sourceYaml": "../../references/bibliography.yaml",
    "sources": [
      {
        "id": "dit_2022",
        "kind": "paper",
        "title": "Scalable Diffusion Models with Transformers",
        "authors": [
          "William Peebles",
          "Saining Xie"
        ],
        "year": 2022,
        "identifiers": {
          "arxiv": "2212.09748"
        },
        "url": "https://arxiv.org/abs/2212.09748",
        "href": "https://arxiv.org/abs/2212.09748"
      },
      {
        "id": "dit_models_code",
        "kind": "code",
        "title": "DiT model implementation",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/models.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/models.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/models.py"
      },
      {
        "id": "dit_sample_code",
        "kind": "code",
        "title": "DiT sampling entry point",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/sample.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/sample.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/sample.py"
      },
      {
        "id": "dit_gaussian_diffusion_code",
        "kind": "code",
        "title": "DiT Gaussian diffusion implementation",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/diffusion/gaussian_diffusion.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/diffusion/gaussian_diffusion.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/diffusion/gaussian_diffusion.py"
      },
      {
        "id": "dit_train_code",
        "kind": "code",
        "title": "DiT training entry point",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/train.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/train.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/train.py"
      },
      {
        "id": "af2_2021",
        "kind": "paper",
        "title": "Highly accurate protein structure prediction with AlphaFold",
        "authors": [
          "John Jumper",
          "Richard Evans",
          "Alexander Pritzel",
          "Tim Green",
          "Michael Figurnov",
          "Olaf Ronneberger",
          "Kathryn Tunyasuvunakool",
          "Russ Bates",
          "Augustin Zidek",
          "Anna Potapenko",
          "Alex Bridgland",
          "Clemens Meyer",
          "Simon A. A. Kohl",
          "Andrew J. Ballard",
          "Andrew Cowie",
          "Bernardino Romera-Paredes",
          "Stanislav Nikolov",
          "Rishub Jain",
          "Jonas Adler",
          "Trevor Back",
          "Stig Petersen",
          "David Reiman",
          "Ellen Clancy",
          "Michal Zielinski",
          "Martin Steinegger",
          "Michalina Pacholska",
          "Tamas Berghammer",
          "Sebastian Bodenstein",
          "David Silver",
          "Oriol Vinyals",
          "Andrew W. Senior",
          "Koray Kavukcuoglu",
          "Pushmeet Kohli",
          "Demis Hassabis"
        ],
        "year": 2021,
        "identifiers": {
          "doi": "10.1038/s41586-021-03819-2"
        },
        "url": "https://www.nature.com/articles/s41586-021-03819-2",
        "href": "https://www.nature.com/articles/s41586-021-03819-2"
      },
      {
        "id": "af2_2021_supplement",
        "kind": "paper",
        "title": "Highly accurate protein structure prediction with AlphaFold: Supplementary Information",
        "authors": [
          "John Jumper",
          "Richard Evans",
          "Alexander Pritzel",
          "Tim Green",
          "Michael Figurnov",
          "Olaf Ronneberger",
          "Kathryn Tunyasuvunakool",
          "Russ Bates",
          "Augustin Zidek",
          "Anna Potapenko",
          "Alex Bridgland",
          "Clemens Meyer",
          "Simon A. A. Kohl",
          "Andrew J. Ballard",
          "Andrew Cowie",
          "Bernardino Romera-Paredes",
          "Stanislav Nikolov",
          "Rishub Jain",
          "Jonas Adler",
          "Trevor Back",
          "Stig Petersen",
          "David Reiman",
          "Ellen Clancy",
          "Michal Zielinski",
          "Martin Steinegger",
          "Michalina Pacholska",
          "Tamas Berghammer",
          "Sebastian Bodenstein",
          "David Silver",
          "Oriol Vinyals",
          "Andrew W. Senior",
          "Koray Kavukcuoglu",
          "Pushmeet Kohli",
          "Demis Hassabis"
        ],
        "year": 2021,
        "identifiers": {
          "doi": "10.1038/s41586-021-03819-2",
          "component": "supplementary_information"
        },
        "url": "https://static-content.springer.com/esm/art%3A10.1038%2Fs41586-021-03819-2/MediaObjects/41586_2021_3819_MOESM1_ESM.pdf",
        "href": "https://static-content.springer.com/esm/art%3A10.1038%2Fs41586-021-03819-2/MediaObjects/41586_2021_3819_MOESM1_ESM.pdf"
      },
      {
        "id": "af2_runner_code",
        "kind": "code",
        "title": "AlphaFold prediction and ranking entry point",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "run_alphafold.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/run_alphafold.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/run_alphafold.py"
      },
      {
        "id": "af2_data_pipeline_code",
        "kind": "code",
        "title": "AlphaFold monomer input feature pipeline",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/data/pipeline.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/data/pipeline.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/data/pipeline.py"
      },
      {
        "id": "af2_model_wrapper_code",
        "kind": "code",
        "title": "AlphaFold model runner and monomer selection wrapper",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/model.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/model.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/model.py"
      },
      {
        "id": "af2_model_code",
        "kind": "code",
        "title": "AlphaFold monomer model and recycling implementation",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/modules.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/modules.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/modules.py"
      },
      {
        "id": "af2_structure_code",
        "kind": "code",
        "title": "AlphaFold monomer structure module",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/folding.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/folding.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/folding.py"
      },
      {
        "id": "af2_config_code",
        "kind": "code",
        "title": "AlphaFold model configuration",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/config.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/config.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/config.py"
      },
      {
        "id": "af2_relax_code",
        "kind": "code",
        "title": "AlphaFold Amber relaxation wrapper",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/relax/relax.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/relax/relax.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/relax/relax.py"
      },
      {
        "id": "genie2_2024",
        "kind": "paper",
        "title": "Out of Many, One: Designing and Scaffolding Proteins at the Scale of the Structural Universe with Genie 2",
        "authors": [
          "Yeqing Lin",
          "Minji Lee",
          "Zhao Zhang",
          "Mohammed AlQuraishi"
        ],
        "year": 2024,
        "identifiers": {
          "arxiv": "2405.15489"
        },
        "url": "https://arxiv.org/abs/2405.15489",
        "href": "https://arxiv.org/abs/2405.15489"
      },
      {
        "id": "genie2_model_code",
        "kind": "code",
        "title": "Genie 2 denoiser composition",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/model.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/model.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/model.py"
      },
      {
        "id": "genie2_single_feature_code",
        "kind": "code",
        "title": "Genie 2 single-feature network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/single_feature_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/single_feature_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/single_feature_net.py"
      },
      {
        "id": "genie2_pair_feature_code",
        "kind": "code",
        "title": "Genie 2 pair-feature network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/pair_feature_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_feature_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_feature_net.py"
      },
      {
        "id": "genie2_pair_transform_code",
        "kind": "code",
        "title": "Genie 2 pair-transform network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/pair_transform_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_transform_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_transform_net.py"
      },
      {
        "id": "genie2_structure_code",
        "kind": "code",
        "title": "Genie 2 equivariant structure network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/structure_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/structure_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/structure_net.py"
      },
      {
        "id": "genie2_ipa_code",
        "kind": "code",
        "title": "Genie 2 invariant point attention module",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/modules/invariant_point_attention.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/modules/invariant_point_attention.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/modules/invariant_point_attention.py"
      },
      {
        "id": "genie2_sampler_code",
        "kind": "code",
        "title": "Genie 2 reverse-diffusion sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/sampler/base.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/base.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/base.py"
      },
      {
        "id": "genie2_scaffold_sampler_code",
        "kind": "code",
        "title": "Genie 2 motif-scaffolding sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/sampler/scaffold.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/scaffold.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/scaffold.py"
      },
      {
        "id": "genie2_training_code",
        "kind": "code",
        "title": "Genie 2 diffusion training step",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/diffusion/genie.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/diffusion/genie.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/diffusion/genie.py"
      },
      {
        "id": "genie2_config_code",
        "kind": "code",
        "title": "Genie 2 model and diffusion configuration",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/config.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/config.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/config.py"
      },
      {
        "id": "genie2_base_config",
        "kind": "code",
        "title": "Genie 2 released base-checkpoint configuration",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "results/base/configuration",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/results/base/configuration",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/results/base/configuration"
      },
      {
        "id": "genie3_2026",
        "kind": "paper",
        "title": "Fast and Ultra-Capable Protein Design: Advancing the Frontier Through Atomistic SE(3)-Equivariance with Genie 3",
        "authors": [
          "Yeqing Lin",
          "Minji Lee",
          "Siddharth Vermani",
          "Yuwei Jiang",
          "Robbe De Cooman",
          "Bryan Spetko",
          "Mohammed AlQuraishi"
        ],
        "year": 2026,
        "identifiers": {
          "doi": "10.64898/2026.05.01.722168"
        },
        "url": "https://www.biorxiv.org/content/10.64898/2026.05.01.722168v1",
        "href": "https://www.biorxiv.org/content/10.64898/2026.05.01.722168v1"
      },
      {
        "id": "genie3_model_code",
        "kind": "code",
        "title": "Genie 3 V1 denoiser composition",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/implementation/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/implementation/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/implementation/v1.py"
      },
      {
        "id": "genie3_single_feature_code",
        "kind": "code",
        "title": "Genie 3 V1 single-feature embedder",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/embedder/single/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/single/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/single/v1.py"
      },
      {
        "id": "genie3_pair_feature_code",
        "kind": "code",
        "title": "Genie 3 V1 pair-feature embedder",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/embedder/pair/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/pair/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/pair/v1.py"
      },
      {
        "id": "genie3_latent_transformer_code",
        "kind": "code",
        "title": "Genie 3 latent transformer",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/latent/transformer.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/latent/transformer.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/latent/transformer.py"
      },
      {
        "id": "genie3_structure_code",
        "kind": "code",
        "title": "Genie 3 equivariant structure decoder",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/structure_net.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/structure_net.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/structure_net.py"
      },
      {
        "id": "genie3_ipa_code",
        "kind": "code",
        "title": "Genie 3 full and reduced invariant point attention modules",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/module/invariant_point_attention.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/module/invariant_point_attention.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/module/invariant_point_attention.py"
      },
      {
        "id": "genie3_sequence_code",
        "kind": "code",
        "title": "Genie 3 optional sequence head",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/sequence_net.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/sequence_net.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/sequence_net.py"
      },
      {
        "id": "genie3_geometry_code",
        "kind": "code",
        "title": "Genie 3 Frenet frame construction",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/utils/geo_utils.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/geo_utils.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/geo_utils.py"
      },
      {
        "id": "genie3_feature_code",
        "kind": "code",
        "title": "Genie 3 protein tokenization and conditioning features",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/utils/feat_utils.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/feat_utils.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/feat_utils.py"
      },
      {
        "id": "genie3_feature_schema_code",
        "kind": "code",
        "title": "Genie 3 feature dictionary registry",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/np/features.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/np/features.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/np/features.py"
      },
      {
        "id": "genie3_sample_dataset_registry_code",
        "kind": "code",
        "title": "Genie 3 generation task-source router",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/data/sample_dataset/registry.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/data/sample_dataset/registry.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/data/sample_dataset/registry.py"
      },
      {
        "id": "genie3_diffusion_code",
        "kind": "code",
        "title": "Genie 3 DDPM training objective",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/diffusion/ddpm.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/ddpm.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/ddpm.py"
      },
      {
        "id": "genie3_sampler_code",
        "kind": "code",
        "title": "Genie 3 base reverse-diffusion sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/diffusion/sampler/sampler.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/sampler.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/sampler.py"
      },
      {
        "id": "genie3_ddim_code",
        "kind": "code",
        "title": "Genie 3 DDIM directional-scaling sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/diffusion/sampler/ddim.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/ddim.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/ddim.py"
      },
      {
        "id": "genie3_config_code",
        "kind": "code",
        "title": "Genie 3 V1 architecture configuration",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/config/model/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/config/model/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/config/model/v1.py"
      },
      {
        "id": "genie3_export_code",
        "kind": "code",
        "title": "Genie 3 generated-structure postprocessing",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/runner/postprocess.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/runner/postprocess.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/runner/postprocess.py"
      },
      {
        "id": "generic_feature_refinement_source",
        "kind": "source",
        "title": "Generic Feature Refinement architecture source",
        "path": "architectures/generic-feature-refinement.yaml",
        "href": "../../architectures/generic-feature-refinement.yaml"
      },
      {
        "id": "architecture_language_protocol",
        "kind": "protocol",
        "title": "Architecture language protocol",
        "path": "protocol/architecture-language.md",
        "href": "../../protocol/architecture-language.md"
      }
    ]
  },
  "standardBlocks": {
  },
  "pseudocode": {
    "alphafold2": {
      "schemaVersion": "pseudocode-v0.2",
      "compilerVersion": "semantic-pseudocode-compiler-v0.3",
      "id": "alphafold2",
      "title": "AlphaFold 2 Monomer Network Trace",
      "rootScope": "scopes.monomer_prediction",
      "sources": [
        {
          "id": "paper",
          "source_ref": "af2_2021"
        },
        {
          "id": "supplement",
          "source_ref": "af2_2021_supplement"
        },
        {
          "id": "data_pipeline_code",
          "source_ref": "af2_data_pipeline_code"
        },
        {
          "id": "model_code",
          "source_ref": "af2_model_code"
        },
        {
          "id": "structure_code",
          "source_ref": "af2_structure_code"
        }
      ],
      "scopes": [
        {
          "id": "monomer_prediction",
          "ref": "scopes.monomer_prediction",
          "label": "AlphaFold 2 monomer prediction",
          "kind": "program",
          "parentRef": "pseudocode",
          "subjectRef": "architecture"
        },
        {
          "id": "recycling_loop",
          "ref": "scopes.recycling_loop",
          "label": "Four shared-weight AlphaFold executions",
          "kind": "loop",
          "parentRef": "scopes.monomer_prediction",
          "subjectRef": "modules.alphafold_iteration",
          "executionRef": "execution.loops.recycling_loop"
        }
      ],
      "symbols": [
        {
          "id": "input_sequence",
          "name": "sequence",
          "type": "input",
          "shape": "N_res residues",
          "representationRef": "representations.amino_acid_sequence",
          "scale": "residue",
          "glyph": "vector",
          "scopeRef": "scopes.monomer_prediction",
          "architectureRef": "value_sites.input_sequence"
        },
        {
          "id": "multiple_sequence_alignment",
          "name": "msa_features",
          "type": "representation",
          "shape": "N_seq x N_res aligned residues and deletion features",
          "representationRef": "representations.msa_features",
          "scale": "msa",
          "glyph": "matrix",
          "scopeRef": "scopes.monomer_prediction",
          "architectureRef": "value_sites.multiple_sequence_alignment"
        },
        {
          "id": "target_pair_features",
          "name": "target_pair",
          "type": "representation",
          "shape": "N_res x N_res x f_pair",
          "representationRef": "representations.target_pair_features",
          "scale": "pair",
          "glyph": "pair",
          "scopeRef": "scopes.monomer_prediction",
          "architectureRef": "value_sites.target_pair_features"
        },
        {
          "id": "structural_templates",
          "name": "templates",
          "type": "representation",
          "shape": "N_templ x N_res x N_res x f_template",
          "representationRef": "representations.template_features",
          "scale": "template",
          "glyph": "volume",
          "scopeRef": "scopes.monomer_prediction",
          "architectureRef": "value_sites.structural_templates"
        },
        {
          "id": "predicted_structure_output",
          "name": "prediction",
          "type": "output",
          "shape": "N_res x 37 x 3 coordinates plus N_res pLDDT",
          "representationRef": "representations.structure_prediction",
          "scale": "atom",
          "glyph": "coordinates",
          "scopeRef": "scopes.monomer_prediction",
          "architectureRef": "value_sites.predicted_structure_output"
        },
        {
          "id": "recycled_msa_before_iteration",
          "name": "prev_msa_row",
          "type": "state",
          "shape": "N_res x 256",
          "representationRef": "representations.msa_first_row",
          "scale": "residue",
          "glyph": "single",
          "scopeRef": "scopes.recycling_loop",
          "architectureRef": "value_sites.recycled_msa_before_iteration"
        },
        {
          "id": "recycled_pair_before_iteration",
          "name": "prev_pair",
          "type": "state",
          "shape": "N_res x N_res x 128",
          "representationRef": "representations.pair_representation",
          "scale": "pair",
          "glyph": "pair",
          "scopeRef": "scopes.recycling_loop",
          "architectureRef": "value_sites.recycled_pair_before_iteration"
        },
        {
          "id": "recycled_coordinates_before_iteration",
          "name": "prev_pseudo_beta",
          "type": "state",
          "shape": "N_res x 3",
          "representationRef": "representations.pseudo_beta_coordinates",
          "scale": "residue",
          "glyph": "coordinates",
          "scopeRef": "scopes.recycling_loop",
          "architectureRef": "value_sites.recycled_coordinates_before_iteration"
        },
        {
          "id": "msa_recycle_update",
          "name": "msa_recycle_update",
          "type": "conditioning",
          "shape": "N_res x 256",
          "representationRef": "representations.msa_first_row",
          "scale": "residue",
          "glyph": "single",
          "scopeRef": "scopes.recycling_loop",
          "architectureRef": "value_sites.msa_recycle_update"
        },
        {
          "id": "pair_recycle_update",
          "name": "pair_recycle_update",
          "type": "conditioning",
          "shape": "N_res x N_res x 128",
          "representationRef": "representations.pair_representation",
          "scale": "pair",
          "glyph": "pair",
          "scopeRef": "scopes.recycling_loop",
          "architectureRef": "value_sites.pair_recycle_update"
        },
        {
          "id": "msa_representation_before_evoformer",
          "name": "msa_state",
          "type": "state",
          "shape": "N_seq x N_res x 256",
          "representationRef": "representations.msa_representation",
          "scale": "msa",
          "glyph": "matrix",
          "scopeRef": "scopes.recycling_loop",
          "architectureRef": "value_sites.msa_representation_before_evoformer"
        },
        {
          "id": "pair_representation_before_evoformer",
          "name": "pair_state",
          "type": "state",
          "shape": "N_res x N_res x 128",
          "representationRef": "representations.pair_representation",
          "scale": "pair",
          "glyph": "pair",
          "scopeRef": "scopes.recycling_loop",
          "architectureRef": "value_sites.pair_representation_before_evoformer"
        },
        {
          "id": "msa_representation_after_evoformer",
          "name": "processed_msa",
          "type": "state",
          "shape": "N_seq x N_res x 256",
          "representationRef": "representations.msa_representation",
          "scale": "msa",
          "glyph": "matrix",
          "scopeRef": "scopes.recycling_loop",
          "architectureRef": "value_sites.msa_representation_after_evoformer"
        },
        {
          "id": "single_representation_after_evoformer",
          "name": "single_state",
          "type": "representation",
          "shape": "N_res x 384",
          "representationRef": "representations.single_representation",
          "scale": "residue",
          "glyph": "single",
          "scopeRef": "scopes.recycling_loop",
          "architectureRef": "value_sites.single_representation_after_evoformer"
        },
        {
          "id": "pair_representation_after_evoformer",
          "name": "processed_pair",
          "type": "state",
          "shape": "N_res x N_res x 128",
          "representationRef": "representations.pair_representation",
          "scale": "pair",
          "glyph": "pair",
          "scopeRef": "scopes.recycling_loop",
          "architectureRef": "value_sites.pair_representation_after_evoformer"
        },
        {
          "id": "recycled_msa_after_iteration",
          "name": "next_msa_row",
          "type": "state",
          "shape": "N_res x 256",
          "representationRef": "representations.msa_first_row",
          "scale": "residue",
          "glyph": "single",
          "scopeRef": "scopes.recycling_loop",
          "architectureRef": "value_sites.recycled_msa_after_iteration"
        },
        {
          "id": "recycled_pair_after_iteration",
          "name": "next_pair",
          "type": "state",
          "shape": "N_res x N_res x 128",
          "representationRef": "representations.pair_representation",
          "scale": "pair",
          "glyph": "pair",
          "scopeRef": "scopes.recycling_loop",
          "architectureRef": "value_sites.recycled_pair_after_iteration"
        },
        {
          "id": "recycled_coordinates_after_iteration",
          "name": "next_pseudo_beta",
          "type": "state",
          "shape": "N_res x 3",
          "representationRef": "representations.pseudo_beta_coordinates",
          "scale": "residue",
          "glyph": "coordinates",
          "scopeRef": "scopes.recycling_loop",
          "architectureRef": "value_sites.recycled_coordinates_after_iteration"
        }
      ],
      "lines": [
        {
          "id": "search_genetic_databases",
          "text": "msa_features = GeneticDatabaseSearch(sequence)",
          "comment": "Search sequence databases, deduplicate homologues, and align them to the target sequence.",
          "refs": "Supplementary Methods 1.2.2, DataPipeline.process",
          "sourceRefs": [
            {
              "source": "supplement",
              "locator": "Supplementary Methods 1.2.2"
            },
            {
              "source": "data_pipeline_code",
              "locator": "DataPipeline.process"
            }
          ],
          "scopeRef": "scopes.monomer_prediction",
          "statementRef": "modules.genetic_database_search",
          "architectureRefs": [
            "modules.genetic_database_search",
            "relations.input_sequence_queries_genetic_database",
            "relations.genetic_search_produces_msa"
          ],
          "operation": "genetic_database_search",
          "inputs": [
            "input_sequence"
          ],
          "outputs": [
            "multiple_sequence_alignment"
          ],
          "codeBindings": [
            {
              "lexeme": "msa_features",
              "access": "write",
              "symbolId": "multiple_sequence_alignment",
              "architectureRef": "value_sites.multiple_sequence_alignment",
              "occurrences": [
                {
                  "start": 0,
                  "end": 12
                }
              ]
            },
            {
              "lexeme": "GeneticDatabaseSearch",
              "access": "call",
              "architectureRef": "modules.genetic_database_search",
              "occurrences": [
                {
                  "start": 15,
                  "end": 36
                }
              ]
            },
            {
              "lexeme": "sequence",
              "access": "read",
              "symbolId": "input_sequence",
              "architectureRef": "value_sites.input_sequence",
              "occurrences": [
                {
                  "start": 37,
                  "end": 45
                }
              ]
            }
          ]
        },
        {
          "id": "pair_target_sequence",
          "text": "target_pair = PairTargetSequence(sequence)",
          "comment": "Outer-sum projected target features and add clipped relative residue positions.",
          "refs": "Supplementary Methods 1.5; Algorithms 3-4",
          "sourceRefs": [
            {
              "source": "supplement",
              "locator": "Supplementary Methods 1.5; Algorithms 3-4"
            }
          ],
          "scopeRef": "scopes.monomer_prediction",
          "statementRef": "modules.sequence_pairing",
          "architectureRefs": [
            "modules.sequence_pairing",
            "relations.input_sequence_enters_pairing",
            "relations.sequence_pairing_produces_target_pair_features"
          ],
          "operation": "build_target_pair_seed",
          "inputs": [
            "input_sequence"
          ],
          "outputs": [
            "target_pair_features"
          ],
          "codeBindings": [
            {
              "lexeme": "target_pair",
              "access": "write",
              "symbolId": "target_pair_features",
              "architectureRef": "value_sites.target_pair_features",
              "occurrences": [
                {
                  "start": 0,
                  "end": 11
                }
              ]
            },
            {
              "lexeme": "PairTargetSequence",
              "access": "call",
              "architectureRef": "modules.sequence_pairing",
              "occurrences": [
                {
                  "start": 14,
                  "end": 32
                }
              ]
            },
            {
              "lexeme": "sequence",
              "access": "read",
              "symbolId": "input_sequence",
              "architectureRef": "value_sites.input_sequence",
              "occurrences": [
                {
                  "start": 33,
                  "end": 41
                }
              ]
            }
          ]
        },
        {
          "id": "search_structure_database",
          "text": "templates = StructureDatabaseSearch(sequence)",
          "comment": "Retrieve structural homologues and featurize their residue, torsion, mask, and pair geometry.",
          "refs": "Supplementary Methods 1.2.3 and 1.2.9, DataPipeline.process",
          "sourceRefs": [
            {
              "source": "supplement",
              "locator": "Supplementary Methods 1.2.3 and 1.2.9"
            },
            {
              "source": "data_pipeline_code",
              "locator": "DataPipeline.process"
            }
          ],
          "scopeRef": "scopes.monomer_prediction",
          "statementRef": "modules.structure_database_search",
          "architectureRefs": [
            "modules.structure_database_search",
            "relations.input_sequence_queries_structure_database",
            "relations.structure_search_produces_templates"
          ],
          "operation": "structure_database_search",
          "inputs": [
            "input_sequence"
          ],
          "outputs": [
            "structural_templates"
          ],
          "codeBindings": [
            {
              "lexeme": "templates",
              "access": "write",
              "symbolId": "structural_templates",
              "architectureRef": "value_sites.structural_templates",
              "occurrences": [
                {
                  "start": 0,
                  "end": 9
                }
              ]
            },
            {
              "lexeme": "StructureDatabaseSearch",
              "access": "call",
              "architectureRef": "modules.structure_database_search",
              "occurrences": [
                {
                  "start": 12,
                  "end": 35
                }
              ]
            },
            {
              "lexeme": "sequence",
              "access": "read",
              "symbolId": "input_sequence",
              "architectureRef": "value_sites.input_sequence",
              "occurrences": [
                {
                  "start": 36,
                  "end": 44
                }
              ]
            }
          ]
        },
        {
          "id": "run_recycling_loop",
          "text": "prediction = RecycleAlphaFold(sequence, msa_features, target_pair, templates, passes=4)",
          "comment": "Run one initial shared-weight execution and three feedback executions; return only the final structure and confidence.",
          "refs": "Figure 1e, Supplementary Methods 1.4 and 1.10; Algorithms 2 and 30",
          "sourceRefs": [
            {
              "source": "paper",
              "locator": "Figure 1e"
            },
            {
              "source": "supplement",
              "locator": "Supplementary Methods 1.4 and 1.10; Algorithms 2 and 30"
            }
          ],
          "scopeRef": "scopes.monomer_prediction",
          "statementRef": "modules.alphafold_iteration",
          "calleeScopeRef": "scopes.recycling_loop",
          "architectureRefs": [
            "modules.alphafold_iteration",
            "execution.loops.recycling_loop",
            "claims.three_recycles_mean_four_executions"
          ],
          "operation": "shared_weight_recycling_inference",
          "inputs": [
            "input_sequence",
            "multiple_sequence_alignment",
            "target_pair_features",
            "structural_templates"
          ],
          "outputs": [
            "predicted_structure_output"
          ],
          "codeBindings": [
            {
              "lexeme": "prediction",
              "access": "write",
              "symbolId": "predicted_structure_output",
              "architectureRef": "value_sites.predicted_structure_output",
              "occurrences": [
                {
                  "start": 0,
                  "end": 10
                }
              ]
            },
            {
              "lexeme": "RecycleAlphaFold",
              "access": "call",
              "architectureRef": "modules.alphafold_iteration",
              "occurrences": [
                {
                  "start": 13,
                  "end": 29
                }
              ]
            },
            {
              "lexeme": "sequence",
              "access": "read",
              "symbolId": "input_sequence",
              "architectureRef": "value_sites.input_sequence",
              "occurrences": [
                {
                  "start": 30,
                  "end": 38
                }
              ]
            },
            {
              "lexeme": "msa_features",
              "access": "read",
              "symbolId": "multiple_sequence_alignment",
              "architectureRef": "value_sites.multiple_sequence_alignment",
              "occurrences": [
                {
                  "start": 40,
                  "end": 52
                }
              ]
            },
            {
              "lexeme": "target_pair",
              "access": "read",
              "symbolId": "target_pair_features",
              "architectureRef": "value_sites.target_pair_features",
              "occurrences": [
                {
                  "start": 54,
                  "end": 65
                }
              ]
            },
            {
              "lexeme": "templates",
              "access": "read",
              "symbolId": "structural_templates",
              "architectureRef": "value_sites.structural_templates",
              "occurrences": [
                {
                  "start": 67,
                  "end": 76
                }
              ]
            }
          ]
        },
        {
          "id": "initialize_recycled_msa",
          "text": "prev_msa_row = zeros_like_target_row(msa_features)",
          "comment": "The first execution receives a zero-valued previous target-row state.",
          "refs": "Algorithm 2 line 1 and Supplementary Methods 1.10",
          "sourceRefs": [
            {
              "source": "supplement",
              "locator": "Algorithm 2 line 1 and Supplementary Methods 1.10"
            }
          ],
          "scopeRef": "scopes.recycling_loop",
          "statementRef": "value_sites.recycled_msa_before_iteration",
          "architectureRefs": [
            "value_sites.recycled_msa_before_iteration"
          ],
          "operation": "initialize_recycled_msa_to_zero",
          "inputs": [
            "multiple_sequence_alignment"
          ],
          "outputs": [
            "recycled_msa_before_iteration"
          ],
          "codeBindings": [
            {
              "lexeme": "prev_msa_row",
              "access": "write",
              "symbolId": "recycled_msa_before_iteration",
              "architectureRef": "value_sites.recycled_msa_before_iteration",
              "occurrences": [
                {
                  "start": 0,
                  "end": 12
                }
              ]
            },
            {
              "lexeme": "msa_features",
              "access": "read",
              "symbolId": "multiple_sequence_alignment",
              "architectureRef": "value_sites.multiple_sequence_alignment",
              "occurrences": [
                {
                  "start": 37,
                  "end": 49
                }
              ]
            }
          ]
        },
        {
          "id": "initialize_recycled_pair",
          "text": "prev_pair = zeros_like_pair(sequence)",
          "comment": "The first execution receives a zero-valued previous pair state.",
          "refs": "Algorithm 2 line 1 and Supplementary Methods 1.10",
          "sourceRefs": [
            {
              "source": "supplement",
              "locator": "Algorithm 2 line 1 and Supplementary Methods 1.10"
            }
          ],
          "scopeRef": "scopes.recycling_loop",
          "statementRef": "value_sites.recycled_pair_before_iteration",
          "architectureRefs": [
            "value_sites.recycled_pair_before_iteration"
          ],
          "operation": "initialize_recycled_pair_to_zero",
          "inputs": [
            "input_sequence"
          ],
          "outputs": [
            "recycled_pair_before_iteration"
          ],
          "codeBindings": [
            {
              "lexeme": "prev_pair",
              "access": "write",
              "symbolId": "recycled_pair_before_iteration",
              "architectureRef": "value_sites.recycled_pair_before_iteration",
              "occurrences": [
                {
                  "start": 0,
                  "end": 9
                }
              ]
            },
            {
              "lexeme": "sequence",
              "access": "read",
              "symbolId": "input_sequence",
              "architectureRef": "value_sites.input_sequence",
              "occurrences": [
                {
                  "start": 28,
                  "end": 36
                }
              ]
            }
          ]
        },
        {
          "id": "initialize_recycled_coordinates",
          "text": "prev_pseudo_beta = zeros_like_coordinates(sequence)",
          "comment": "The first execution receives zero-valued previous pseudo-beta coordinates.",
          "refs": "Algorithm 2 line 1 and Supplementary Methods 1.10",
          "sourceRefs": [
            {
              "source": "supplement",
              "locator": "Algorithm 2 line 1 and Supplementary Methods 1.10"
            }
          ],
          "scopeRef": "scopes.recycling_loop",
          "statementRef": "value_sites.recycled_coordinates_before_iteration",
          "architectureRefs": [
            "value_sites.recycled_coordinates_before_iteration"
          ],
          "operation": "initialize_recycled_coordinates_to_zero",
          "inputs": [
            "input_sequence"
          ],
          "outputs": [
            "recycled_coordinates_before_iteration"
          ],
          "codeBindings": [
            {
              "lexeme": "prev_pseudo_beta",
              "access": "write",
              "symbolId": "recycled_coordinates_before_iteration",
              "architectureRef": "value_sites.recycled_coordinates_before_iteration",
              "occurrences": [
                {
                  "start": 0,
                  "end": 16
                }
              ]
            },
            {
              "lexeme": "sequence",
              "access": "read",
              "symbolId": "input_sequence",
              "architectureRef": "value_sites.input_sequence",
              "occurrences": [
                {
                  "start": 42,
                  "end": 50
                }
              ]
            }
          ]
        },
        {
          "id": "embed_recycled_state",
          "text": "msa_recycle_update, pair_recycle_update = RecyclingEmbedder(prev_msa_row, prev_pair, prev_pseudo_beta)",
          "comment": "Normalize previous latent states and add a binned pseudo-beta distance embedding to the pair update.",
          "refs": "Supplementary Methods 1.10; Algorithm 32, AlphaFoldIteration; recycling feature embedding",
          "sourceRefs": [
            {
              "source": "supplement",
              "locator": "Supplementary Methods 1.10; Algorithm 32"
            },
            {
              "source": "model_code",
              "locator": "AlphaFoldIteration; recycling feature embedding"
            }
          ],
          "scopeRef": "scopes.recycling_loop",
          "statementRef": "modules.recycling_embedder",
          "architectureRefs": [
            "modules.recycling_embedder",
            "relations.recycled_msa_enters_recycling_embedder",
            "relations.recycled_pair_enters_recycling_embedder",
            "relations.recycled_coordinates_enter_recycling_embedder",
            "relations.recycling_embedder_produces_msa_update",
            "relations.recycling_embedder_produces_pair_update"
          ],
          "operation": "embed_recycled_outputs",
          "inputs": [
            "recycled_msa_before_iteration",
            "recycled_pair_before_iteration",
            "recycled_coordinates_before_iteration"
          ],
          "outputs": [
            "msa_recycle_update",
            "pair_recycle_update"
          ],
          "codeBindings": [
            {
              "lexeme": "msa_recycle_update",
              "access": "write",
              "symbolId": "msa_recycle_update",
              "architectureRef": "value_sites.msa_recycle_update",
              "occurrences": [
                {
                  "start": 0,
                  "end": 18
                }
              ]
            },
            {
              "lexeme": "pair_recycle_update",
              "access": "write",
              "symbolId": "pair_recycle_update",
              "architectureRef": "value_sites.pair_recycle_update",
              "occurrences": [
                {
                  "start": 20,
                  "end": 39
                }
              ]
            },
            {
              "lexeme": "RecyclingEmbedder",
              "access": "call",
              "architectureRef": "modules.recycling_embedder",
              "occurrences": [
                {
                  "start": 42,
                  "end": 59
                }
              ]
            },
            {
              "lexeme": "prev_msa_row",
              "access": "read",
              "symbolId": "recycled_msa_before_iteration",
              "architectureRef": "value_sites.recycled_msa_before_iteration",
              "occurrences": [
                {
                  "start": 60,
                  "end": 72
                }
              ]
            },
            {
              "lexeme": "prev_pair",
              "access": "read",
              "symbolId": "recycled_pair_before_iteration",
              "architectureRef": "value_sites.recycled_pair_before_iteration",
              "occurrences": [
                {
                  "start": 74,
                  "end": 83
                }
              ]
            },
            {
              "lexeme": "prev_pseudo_beta",
              "access": "read",
              "symbolId": "recycled_coordinates_before_iteration",
              "architectureRef": "value_sites.recycled_coordinates_before_iteration",
              "occurrences": [
                {
                  "start": 85,
                  "end": 101
                }
              ]
            }
          ]
        },
        {
          "id": "embed_model_inputs",
          "text": "msa_state, pair_state = InputEmbedder(sequence, msa_features, target_pair, templates, msa_recycle_update, pair_recycle_update)",
          "comment": "Initialize both representation tracks and add the recycled updates to the new target-row and pair states.",
          "refs": "Supplementary Methods 1.4-1.5; Algorithms 2-4, EmbeddingsAndEvoformer",
          "sourceRefs": [
            {
              "source": "supplement",
              "locator": "Supplementary Methods 1.4-1.5; Algorithms 2-4"
            },
            {
              "source": "model_code",
              "locator": "EmbeddingsAndEvoformer"
            }
          ],
          "scopeRef": "scopes.recycling_loop",
          "statementRef": "modules.input_embedder",
          "architectureRefs": [
            "modules.input_embedder",
            "relations.msa_features_enter_input_embedder",
            "relations.target_pair_features_enter_input_embedder",
            "relations.templates_enter_input_embedder",
            "relations.msa_recycle_update_conditions_input_embedder",
            "relations.pair_recycle_update_conditions_input_embedder",
            "relations.input_embedder_initializes_msa_representation",
            "relations.input_embedder_initializes_pair_representation"
          ],
          "operation": "embed_and_integrate_model_inputs",
          "inputs": [
            "input_sequence",
            "multiple_sequence_alignment",
            "target_pair_features",
            "structural_templates",
            "msa_recycle_update",
            "pair_recycle_update"
          ],
          "outputs": [
            "msa_representation_before_evoformer",
            "pair_representation_before_evoformer"
          ],
          "codeBindings": [
            {
              "lexeme": "msa_state",
              "access": "write",
              "symbolId": "msa_representation_before_evoformer",
              "architectureRef": "value_sites.msa_representation_before_evoformer",
              "occurrences": [
                {
                  "start": 0,
                  "end": 9
                }
              ]
            },
            {
              "lexeme": "pair_state",
              "access": "write",
              "symbolId": "pair_representation_before_evoformer",
              "architectureRef": "value_sites.pair_representation_before_evoformer",
              "occurrences": [
                {
                  "start": 11,
                  "end": 21
                }
              ]
            },
            {
              "lexeme": "InputEmbedder",
              "access": "call",
              "architectureRef": "modules.input_embedder",
              "occurrences": [
                {
                  "start": 24,
                  "end": 37
                }
              ]
            },
            {
              "lexeme": "sequence",
              "access": "read",
              "symbolId": "input_sequence",
              "architectureRef": "value_sites.input_sequence",
              "occurrences": [
                {
                  "start": 38,
                  "end": 46
                }
              ]
            },
            {
              "lexeme": "msa_features",
              "access": "read",
              "symbolId": "multiple_sequence_alignment",
              "architectureRef": "value_sites.multiple_sequence_alignment",
              "occurrences": [
                {
                  "start": 48,
                  "end": 60
                }
              ]
            },
            {
              "lexeme": "target_pair",
              "access": "read",
              "symbolId": "target_pair_features",
              "architectureRef": "value_sites.target_pair_features",
              "occurrences": [
                {
                  "start": 62,
                  "end": 73
                }
              ]
            },
            {
              "lexeme": "templates",
              "access": "read",
              "symbolId": "structural_templates",
              "architectureRef": "value_sites.structural_templates",
              "occurrences": [
                {
                  "start": 75,
                  "end": 84
                }
              ]
            },
            {
              "lexeme": "msa_recycle_update",
              "access": "read",
              "symbolId": "msa_recycle_update",
              "architectureRef": "value_sites.msa_recycle_update",
              "occurrences": [
                {
                  "start": 86,
                  "end": 104
                }
              ]
            },
            {
              "lexeme": "pair_recycle_update",
              "access": "read",
              "symbolId": "pair_recycle_update",
              "architectureRef": "value_sites.pair_recycle_update",
              "occurrences": [
                {
                  "start": 106,
                  "end": 125
                }
              ]
            }
          ]
        },
        {
          "id": "run_evoformer",
          "text": "processed_msa, single_state, processed_pair = Evoformer48(msa_state, pair_state)",
          "comment": "Forty-eight blocks exchange information between the MSA and pair towers and project the final target row to single features.",
          "refs": "Figure 1e and the Evoformer section, Supplementary Methods 1.6; Algorithm 6, EmbeddingsAndEvoformer",
          "sourceRefs": [
            {
              "source": "paper",
              "locator": "Figure 1e and the Evoformer section"
            },
            {
              "source": "supplement",
              "locator": "Supplementary Methods 1.6; Algorithm 6"
            },
            {
              "source": "model_code",
              "locator": "EmbeddingsAndEvoformer"
            }
          ],
          "scopeRef": "scopes.recycling_loop",
          "statementRef": "modules.evoformer_stack",
          "architectureRefs": [
            "modules.evoformer_stack",
            "relations.initial_msa_enters_evoformer",
            "relations.initial_pair_enters_evoformer",
            "relations.evoformer_produces_processed_msa",
            "relations.evoformer_projects_single_representation",
            "relations.evoformer_produces_processed_pair"
          ],
          "operation": "joint_msa_pair_refinement",
          "inputs": [
            "msa_representation_before_evoformer",
            "pair_representation_before_evoformer"
          ],
          "outputs": [
            "msa_representation_after_evoformer",
            "single_representation_after_evoformer",
            "pair_representation_after_evoformer"
          ],
          "codeBindings": [
            {
              "lexeme": "processed_msa",
              "access": "write",
              "symbolId": "msa_representation_after_evoformer",
              "architectureRef": "value_sites.msa_representation_after_evoformer",
              "occurrences": [
                {
                  "start": 0,
                  "end": 13
                }
              ]
            },
            {
              "lexeme": "single_state",
              "access": "write",
              "symbolId": "single_representation_after_evoformer",
              "architectureRef": "value_sites.single_representation_after_evoformer",
              "occurrences": [
                {
                  "start": 15,
                  "end": 27
                }
              ]
            },
            {
              "lexeme": "processed_pair",
              "access": "write",
              "symbolId": "pair_representation_after_evoformer",
              "architectureRef": "value_sites.pair_representation_after_evoformer",
              "occurrences": [
                {
                  "start": 29,
                  "end": 43
                }
              ]
            },
            {
              "lexeme": "Evoformer48",
              "access": "call",
              "architectureRef": "modules.evoformer_stack",
              "occurrences": [
                {
                  "start": 46,
                  "end": 57
                }
              ]
            },
            {
              "lexeme": "msa_state",
              "access": "read",
              "symbolId": "msa_representation_before_evoformer",
              "architectureRef": "value_sites.msa_representation_before_evoformer",
              "occurrences": [
                {
                  "start": 58,
                  "end": 67
                }
              ]
            },
            {
              "lexeme": "pair_state",
              "access": "read",
              "symbolId": "pair_representation_before_evoformer",
              "architectureRef": "value_sites.pair_representation_before_evoformer",
              "occurrences": [
                {
                  "start": 69,
                  "end": 79
                }
              ]
            }
          ]
        },
        {
          "id": "predict_structure",
          "text": "prediction = StructureModule8(single_state, processed_pair)",
          "comment": "Eight equivariant refinement blocks predict residue frames, torsions, all-heavy-atom coordinates, and per-residue confidence.",
          "refs": "Figure 1e and the end-to-end structure prediction section, Supplementary Methods 1.8 and 1.9.6; Algorithms 20 and 29, StructureModule",
          "sourceRefs": [
            {
              "source": "paper",
              "locator": "Figure 1e and the end-to-end structure prediction section"
            },
            {
              "source": "supplement",
              "locator": "Supplementary Methods 1.8 and 1.9.6; Algorithms 20 and 29"
            },
            {
              "source": "structure_code",
              "locator": "StructureModule"
            }
          ],
          "scopeRef": "scopes.recycling_loop",
          "statementRef": "modules.structure_module",
          "architectureRefs": [
            "modules.structure_module",
            "relations.single_representation_enters_structure_module",
            "relations.pair_representation_enters_structure_module",
            "relations.structure_module_predicts_structure_and_confidence"
          ],
          "operation": "equivariant_structure_and_confidence_prediction",
          "inputs": [
            "single_representation_after_evoformer",
            "pair_representation_after_evoformer"
          ],
          "outputs": [
            "predicted_structure_output"
          ],
          "codeBindings": [
            {
              "lexeme": "prediction",
              "access": "write",
              "symbolId": "predicted_structure_output",
              "architectureRef": "value_sites.predicted_structure_output",
              "occurrences": [
                {
                  "start": 0,
                  "end": 10
                }
              ]
            },
            {
              "lexeme": "StructureModule8",
              "access": "call",
              "architectureRef": "modules.structure_module",
              "occurrences": [
                {
                  "start": 13,
                  "end": 29
                }
              ]
            },
            {
              "lexeme": "single_state",
              "access": "read",
              "symbolId": "single_representation_after_evoformer",
              "architectureRef": "value_sites.single_representation_after_evoformer",
              "occurrences": [
                {
                  "start": 30,
                  "end": 42
                }
              ]
            },
            {
              "lexeme": "processed_pair",
              "access": "read",
              "symbolId": "pair_representation_after_evoformer",
              "architectureRef": "value_sites.pair_representation_after_evoformer",
              "occurrences": [
                {
                  "start": 44,
                  "end": 58
                }
              ]
            }
          ]
        },
        {
          "id": "select_next_msa_recycle_state",
          "text": "next_msa_row = processed_msa[0]",
          "comment": "Select the final target row for recycling; this is distinct from the projected single representation.",
          "refs": "Supplementary Methods 1.10; Algorithm 32",
          "sourceRefs": [
            {
              "source": "supplement",
              "locator": "Supplementary Methods 1.10; Algorithm 32"
            }
          ],
          "scopeRef": "scopes.recycling_loop",
          "statementRef": "relations.processed_msa_supplies_recycled_first_row",
          "architectureRefs": [
            "relations.processed_msa_supplies_recycled_first_row",
            "claims.recycling_uses_msa_pair_and_geometry"
          ],
          "operation": "select_final_target_msa_row",
          "inputs": [
            "msa_representation_after_evoformer"
          ],
          "outputs": [
            "recycled_msa_after_iteration"
          ],
          "codeBindings": [
            {
              "lexeme": "next_msa_row",
              "access": "write",
              "symbolId": "recycled_msa_after_iteration",
              "architectureRef": "value_sites.recycled_msa_after_iteration",
              "occurrences": [
                {
                  "start": 0,
                  "end": 12
                }
              ]
            },
            {
              "lexeme": "processed_msa",
              "access": "read",
              "symbolId": "msa_representation_after_evoformer",
              "architectureRef": "value_sites.msa_representation_after_evoformer",
              "occurrences": [
                {
                  "start": 15,
                  "end": 28
                }
              ]
            }
          ]
        },
        {
          "id": "select_next_pair_recycle_state",
          "text": "next_pair = processed_pair",
          "refs": "Supplementary Methods 1.10; Algorithm 32",
          "sourceRefs": [
            {
              "source": "supplement",
              "locator": "Supplementary Methods 1.10; Algorithm 32"
            }
          ],
          "scopeRef": "scopes.recycling_loop",
          "statementRef": "relations.processed_pair_supplies_recycled_pair",
          "architectureRefs": [
            "relations.processed_pair_supplies_recycled_pair"
          ],
          "operation": "retain_final_pair_representation",
          "inputs": [
            "pair_representation_after_evoformer"
          ],
          "outputs": [
            "recycled_pair_after_iteration"
          ],
          "codeBindings": [
            {
              "lexeme": "next_pair",
              "access": "write",
              "symbolId": "recycled_pair_after_iteration",
              "architectureRef": "value_sites.recycled_pair_after_iteration",
              "occurrences": [
                {
                  "start": 0,
                  "end": 9
                }
              ]
            },
            {
              "lexeme": "processed_pair",
              "access": "read",
              "symbolId": "pair_representation_after_evoformer",
              "architectureRef": "value_sites.pair_representation_after_evoformer",
              "occurrences": [
                {
                  "start": 12,
                  "end": 26
                }
              ]
            }
          ]
        },
        {
          "id": "select_next_coordinate_recycle_state",
          "text": "next_pseudo_beta = pseudo_beta(prediction)",
          "refs": "Supplementary Methods 1.10; Algorithm 32",
          "sourceRefs": [
            {
              "source": "supplement",
              "locator": "Supplementary Methods 1.10; Algorithm 32"
            }
          ],
          "scopeRef": "scopes.recycling_loop",
          "statementRef": "relations.predicted_structure_supplies_recycled_coordinates",
          "architectureRefs": [
            "relations.predicted_structure_supplies_recycled_coordinates"
          ],
          "operation": "extract_pseudo_beta_coordinates",
          "inputs": [
            "predicted_structure_output"
          ],
          "outputs": [
            "recycled_coordinates_after_iteration"
          ],
          "codeBindings": [
            {
              "lexeme": "next_pseudo_beta",
              "access": "write",
              "symbolId": "recycled_coordinates_after_iteration",
              "architectureRef": "value_sites.recycled_coordinates_after_iteration",
              "occurrences": [
                {
                  "start": 0,
                  "end": 16
                }
              ]
            },
            {
              "lexeme": "prediction",
              "access": "read",
              "symbolId": "predicted_structure_output",
              "architectureRef": "value_sites.predicted_structure_output",
              "occurrences": [
                {
                  "start": 31,
                  "end": 41
                }
              ]
            }
          ]
        },
        {
          "id": "advance_msa_recycle_state",
          "text": "prev_msa_row = next_msa_row",
          "refs": "Algorithm 2 line 22",
          "sourceRefs": [
            {
              "source": "supplement",
              "locator": "Algorithm 2 line 22"
            }
          ],
          "scopeRef": "scopes.recycling_loop",
          "statementRef": "relations.recycled_msa_advances_to_next_iteration",
          "architectureRefs": [
            "relations.recycled_msa_advances_to_next_iteration"
          ],
          "operation": "advance_msa_recycling_state",
          "inputs": [
            "recycled_msa_after_iteration"
          ],
          "outputs": [
            "recycled_msa_before_iteration"
          ],
          "codeBindings": [
            {
              "lexeme": "prev_msa_row",
              "access": "write",
              "symbolId": "recycled_msa_before_iteration",
              "architectureRef": "value_sites.recycled_msa_before_iteration",
              "occurrences": [
                {
                  "start": 0,
                  "end": 12
                }
              ]
            },
            {
              "lexeme": "next_msa_row",
              "access": "read",
              "symbolId": "recycled_msa_after_iteration",
              "architectureRef": "value_sites.recycled_msa_after_iteration",
              "occurrences": [
                {
                  "start": 15,
                  "end": 27
                }
              ]
            }
          ]
        },
        {
          "id": "advance_pair_recycle_state",
          "text": "prev_pair = next_pair",
          "refs": "Algorithm 2 line 22",
          "sourceRefs": [
            {
              "source": "supplement",
              "locator": "Algorithm 2 line 22"
            }
          ],
          "scopeRef": "scopes.recycling_loop",
          "statementRef": "relations.recycled_pair_advances_to_next_iteration",
          "architectureRefs": [
            "relations.recycled_pair_advances_to_next_iteration"
          ],
          "operation": "advance_pair_recycling_state",
          "inputs": [
            "recycled_pair_after_iteration"
          ],
          "outputs": [
            "recycled_pair_before_iteration"
          ],
          "codeBindings": [
            {
              "lexeme": "prev_pair",
              "access": "write",
              "symbolId": "recycled_pair_before_iteration",
              "architectureRef": "value_sites.recycled_pair_before_iteration",
              "occurrences": [
                {
                  "start": 0,
                  "end": 9
                }
              ]
            },
            {
              "lexeme": "next_pair",
              "access": "read",
              "symbolId": "recycled_pair_after_iteration",
              "architectureRef": "value_sites.recycled_pair_after_iteration",
              "occurrences": [
                {
                  "start": 12,
                  "end": 21
                }
              ]
            }
          ]
        },
        {
          "id": "advance_coordinate_recycle_state",
          "text": "prev_pseudo_beta = next_pseudo_beta",
          "refs": "Algorithm 2 line 22",
          "sourceRefs": [
            {
              "source": "supplement",
              "locator": "Algorithm 2 line 22"
            }
          ],
          "scopeRef": "scopes.recycling_loop",
          "statementRef": "relations.recycled_coordinates_advance_to_next_iteration",
          "architectureRefs": [
            "relations.recycled_coordinates_advance_to_next_iteration"
          ],
          "operation": "advance_coordinate_recycling_state",
          "inputs": [
            "recycled_coordinates_after_iteration"
          ],
          "outputs": [
            "recycled_coordinates_before_iteration"
          ],
          "codeBindings": [
            {
              "lexeme": "prev_pseudo_beta",
              "access": "write",
              "symbolId": "recycled_coordinates_before_iteration",
              "architectureRef": "value_sites.recycled_coordinates_before_iteration",
              "occurrences": [
                {
                  "start": 0,
                  "end": 16
                }
              ]
            },
            {
              "lexeme": "next_pseudo_beta",
              "access": "read",
              "symbolId": "recycled_coordinates_after_iteration",
              "architectureRef": "value_sites.recycled_coordinates_after_iteration",
              "occurrences": [
                {
                  "start": 19,
                  "end": 35
                }
              ]
            }
          ]
        }
      ],
      "claims": [

      ],
      "sourceYaml": "../../pseudocode/alphafold2.yaml"
    }
  },
  "boards": {
    "schemaVersion": "visualization-v0.4",
    "sourceYaml": "../../views/alphafold2-semantic-zoom.view.yaml",
    "rootBoard": "monomer_prediction",
    "items": [
      {
        "id": "monomer_prediction",
        "title": "AlphaFold 2 Monomer Network",
        "summary": "Following the paper's Figure 1e, one target sequence branches into MSA, target-pair, and template evidence; MSA and pair states pass through 48 Evoformer blocks; an eight-block Structure Module predicts a confidence-coloured all-atom structure; the final MSA first row, pair state, and geometry are recycled three times.",
        "subject_ref": "architecture",
        "expansion_depth": 2,
        "grid": {
          "columns": 8,
          "rows": 8,
          "column_sizing": "content",
          "col_gap": 20,
          "row_gap": 20
        },
        "nodes": [
          {
            "id": "input_sequence",
            "ref": "value_sites.input_sequence",
            "label": "input sequence",
            "notation": "sequence",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 4
          },
          {
            "id": "genetic_database_search",
            "ref": "modules.genetic_database_search",
            "label": "genetic database search",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 2
          },
          {
            "id": "multiple_sequence_alignment",
            "ref": "value_sites.multiple_sequence_alignment",
            "label": "MSA",
            "notation": "M",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "matrix",
            "col": 3,
            "row": 2
          },
          {
            "id": "sequence_pairing",
            "ref": "modules.sequence_pairing",
            "label": "pairing",
            "prominence": "secondary",
            "treatment": "chip",
            "density": "micro",
            "col": 2,
            "row": 4
          },
          {
            "id": "structure_database_search",
            "ref": "modules.structure_database_search",
            "label": "structure database search",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 6
          },
          {
            "id": "structural_templates",
            "ref": "value_sites.structural_templates",
            "label": "templates",
            "notation": "templates",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "volume",
            "col": 3,
            "row": 6
          },
          {
            "id": "input_embedder",
            "ref": "modules.input_embedder",
            "label": "input integration",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 4
          },
          {
            "id": "msa_representation_before_evoformer",
            "ref": "value_sites.msa_representation_before_evoformer",
            "label": "MSA representation",
            "notation": "m",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "matrix",
            "col": 4,
            "row": 2
          },
          {
            "id": "pair_representation_before_evoformer",
            "ref": "value_sites.pair_representation_before_evoformer",
            "label": "pair representation",
            "notation": "z",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 4,
            "row": 6
          },
          {
            "id": "evoformer_stack",
            "ref": "modules.evoformer_stack",
            "label": "Evoformer · 48 blocks",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 4
          },
          {
            "id": "msa_representation_after_evoformer",
            "ref": "value_sites.msa_representation_after_evoformer",
            "label": "processed MSA",
            "notation": "m*",
            "role": "its target row is retained for recycling",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "matrix",
            "col": 6,
            "row": 2
          },
          {
            "id": "single_representation_after_evoformer",
            "ref": "value_sites.single_representation_after_evoformer",
            "label": "single representation",
            "notation": "s",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "single",
            "col": 6,
            "row": 4
          },
          {
            "id": "pair_representation_after_evoformer",
            "ref": "value_sites.pair_representation_after_evoformer",
            "label": "pair representation",
            "notation": "z*",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 6,
            "row": 6
          },
          {
            "id": "structure_module",
            "ref": "modules.structure_module",
            "label": "Structure Module · 8 blocks",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 4
          },
          {
            "id": "predicted_structure_output",
            "ref": "value_sites.predicted_structure_output",
            "label": "confidence-coloured 3D structure",
            "notation": "x, pLDDT",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "coordinates",
            "col": 8,
            "row": 4
          },
          {
            "id": "recycling_embedder",
            "ref": "modules.recycling_embedder",
            "label": "recycling ×3",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 7
          }
        ],
        "elide": [
          {
            "ref": "value_sites.target_pair_features"
          },
          {
            "ref": "value_sites.recycled_msa_after_iteration"
          },
          {
            "ref": "value_sites.recycled_msa_before_iteration"
          },
          {
            "ref": "value_sites.recycled_pair_after_iteration"
          },
          {
            "ref": "value_sites.recycled_pair_before_iteration"
          },
          {
            "ref": "value_sites.recycled_coordinates_after_iteration"
          },
          {
            "ref": "value_sites.recycled_coordinates_before_iteration"
          },
          {
            "ref": "value_sites.msa_recycle_update"
          },
          {
            "ref": "value_sites.pair_recycle_update"
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.input_sequence_queries_genetic_database"
            },
            "label": "sequence",
            "connection": {
              "title": "Sequence to genetic search",
              "role": "evolutionary evidence query",
              "inside": "The target sequence launches searches across genetic databases for homologous sequences."
            }
          },
          {
            "match": {
              "relation_ref": "relations.genetic_search_produces_msa"
            },
            "label": "homologues",
            "connection": {
              "title": "Multiple-sequence alignment",
              "role": "evolutionary input",
              "inside": "Search hits are deduplicated and aligned with the target to expose evolutionary variation across residues."
            }
          },
          {
            "match": {
              "relation_ref": "relations.input_sequence_enters_pairing"
            },
            "label": "target features",
            "connection": {
              "title": "Target pairing branch",
              "role": "pair-state initialization",
              "inside": "Target residue features and relative residue indices seed the ordered residue-pair representation."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.sequence_pairing_produces_target_pair_features",
                "relations.target_pair_features_enter_input_embedder"
              ]
            },
            "label": "target pair seed",
            "connection": {
              "title": "Target pair features",
              "role": "initial pair evidence",
              "inside": "Two projected target-feature tracks are combined by outer sum and augmented with clipped relative positions."
            }
          },
          {
            "match": {
              "relation_ref": "relations.input_sequence_queries_structure_database"
            },
            "label": "sequence-derived query",
            "connection": {
              "title": "Sequence to structure search",
              "role": "template lookup",
              "inside": "The target's sequence-derived alignment is used to retrieve and featurize structural homologues."
            }
          },
          {
            "match": {
              "relation_ref": "relations.structure_search_produces_templates"
            },
            "label": "structural hits",
            "connection": {
              "title": "Structural templates",
              "role": "known-structure evidence",
              "inside": "Template hits contribute residue, torsion, mask, and pair-geometry features to model input integration."
            }
          },
          {
            "match": {
              "relation_ref": "relations.msa_features_enter_input_embedder"
            },
            "label": "MSA features",
            "connection": {
              "title": "MSA embedding",
              "role": "initialize evolutionary state",
              "inside": "Clustered MSA features initialize the main MSA track while extra sequences update the pair track through a shallow stack."
            }
          },
          {
            "match": {
              "relation_ref": "relations.templates_enter_input_embedder"
            },
            "label": "template features",
            "connection": {
              "title": "Template integration",
              "role": "structure-derived input",
              "inside": "Template angle features extend the MSA track and template pair features add geometric evidence to the pair track."
            }
          },
          {
            "match": {
              "relation_ref": "relations.input_embedder_initializes_msa_representation"
            },
            "label": "m",
            "connection": {
              "title": "Initial MSA representation",
              "role": "upper Evoformer track",
              "inside": "Embedded target, aligned-sequence, template-angle, and recycled target-row features form the MSA state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.input_embedder_initializes_pair_representation"
            },
            "label": "z",
            "connection": {
              "title": "Initial pair representation",
              "role": "lower Evoformer track",
              "inside": "Target pairing, relative positions, template geometry, extra-MSA updates, and recycled geometry form the pair state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.initial_msa_enters_evoformer"
            },
            "label": "m",
            "connection": {
              "title": "MSA track enters Evoformer",
              "role": "evolutionary state",
              "inside": "Every Evoformer block updates the MSA state and exchanges information with the pair state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.initial_pair_enters_evoformer"
            },
            "label": "z",
            "connection": {
              "title": "Pair track enters Evoformer",
              "role": "residue-pair state",
              "inside": "Every Evoformer block refines residue-pair relationships through outer-product and triangular updates."
            }
          },
          {
            "match": {
              "relation_ref": "relations.evoformer_produces_processed_msa"
            },
            "label": "processed MSA",
            "connection": {
              "title": "Final MSA state",
              "role": "processed evolutionary representation",
              "inside": "After 48 blocks, the full MSA state is retained and its first target row becomes part of the recycling state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.evoformer_projects_single_representation"
            },
            "label": "target-row projection",
            "connection": {
              "title": "Single representation",
              "role": "per-residue structure input",
              "inside": "A learned projection of the final target MSA row produces one 384-channel feature vector per residue."
            }
          },
          {
            "match": {
              "relation_ref": "relations.evoformer_produces_processed_pair"
            },
            "label": "processed pair",
            "connection": {
              "title": "Final pair state",
              "role": "geometric relationship input",
              "inside": "The refined residue-pair representation carries the relational context used by the Structure Module and recycling."
            }
          },
          {
            "match": {
              "relation_ref": "relations.single_representation_enters_structure_module"
            },
            "label": "s",
            "connection": {
              "title": "Singles into Structure Module",
              "role": "mutable per-residue state",
              "inside": "The Structure Module repeatedly updates per-residue invariant features and rigid frames from the single representation."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_representation_enters_structure_module"
            },
            "label": "z",
            "connection": {
              "title": "Pairs into Structure Module",
              "role": "invariant point attention context",
              "inside": "The final pair representation biases residue-to-residue reasoning while the module constructs explicit 3D geometry."
            }
          },
          {
            "match": {
              "relation_ref": "relations.structure_module_predicts_structure_and_confidence"
            },
            "label": "coordinates + pLDDT",
            "connection": {
              "title": "Confidence-coloured structure",
              "role": "task boundary output",
              "inside": "Eight structure blocks refine residue frames, predict torsions, reconstruct all heavy atoms, and attach per-residue confidence."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.processed_msa_supplies_recycled_first_row",
                "relations.recycled_msa_advances_to_next_iteration",
                "relations.recycled_msa_enters_recycling_embedder"
              ]
            },
            "label": "target MSA row",
            "route_side": "bottom",
            "route_clearance": 26,
            "connection": {
              "title": "Recycle target MSA row",
              "role": "previous evolutionary state",
              "inside": "The next execution receives a normalized copy of the previous Evoformer's first MSA row, not the derived single representation."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.processed_pair_supplies_recycled_pair",
                "relations.recycled_pair_advances_to_next_iteration",
                "relations.recycled_pair_enters_recycling_embedder"
              ]
            },
            "label": "pair state",
            "route_side": "bottom",
            "route_clearance": 40,
            "connection": {
              "title": "Recycle pair representation",
              "role": "previous relational state",
              "inside": "The complete final pair representation is normalized before contributing to the next pair input."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.predicted_structure_supplies_recycled_coordinates",
                "relations.recycled_coordinates_advance_to_next_iteration",
                "relations.recycled_coordinates_enter_recycling_embedder"
              ]
            },
            "label": "pseudo-beta geometry",
            "route_side": "bottom",
            "route_clearance": 54,
            "connection": {
              "title": "Recycle predicted geometry",
              "role": "previous structure state",
              "inside": "Previous pseudo-beta distances are binned and projected into a pair-representation update for the next execution."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.recycling_embedder_produces_msa_update",
                "relations.msa_recycle_update_conditions_input_embedder"
              ]
            },
            "label": "recycled MSA",
            "route_side": "bottom",
            "route_clearance": 66,
            "connection": {
              "title": "Inject recycled MSA state",
              "role": "additive target-row update",
              "inside": "The normalized previous target row is added to the newly embedded first MSA row."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.recycling_embedder_produces_pair_update",
                "relations.pair_recycle_update_conditions_input_embedder"
              ]
            },
            "label": "recycled pair + distances",
            "route_side": "bottom",
            "route_clearance": 82,
            "connection": {
              "title": "Inject recycled pair state",
              "role": "additive pair update",
              "inside": "The normalized previous pair state and the embedded previous distance map are added to the new pair representation."
            }
          }
        ],
        "notes": [
          "This starting board deliberately follows Nature Figure 1e rather than the released five-model ranking, Amber-relaxation, and artifact-export workflow.",
          "The paper visually associates recycling with the post-Evoformer single path; the canonical facts preserve the supplement's exact state: final MSA first row, final pair state, and pseudo-beta coordinates."
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_5435cb9b42b0",
            "from": "evoformer_stack",
            "to": "msa_representation_after_evoformer",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.evoformer_produces_processed_msa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.evoformer_produces_processed_msa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.msa_representation"
            ],
            "presentation": {
              "label": "processed MSA",
              "connection": {
                "title": "Final MSA state",
                "role": "processed evolutionary representation",
                "inside": "After 48 blocks, the full MSA state is retained and its first target row becomes part of the recycling state."
              }
            }
          },
          {
            "id": "projection_5663e7713106",
            "from": "evoformer_stack",
            "to": "pair_representation_after_evoformer",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.evoformer_produces_processed_pair"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.evoformer_produces_processed_pair"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_representation"
            ],
            "presentation": {
              "label": "processed pair",
              "connection": {
                "title": "Final pair state",
                "role": "geometric relationship input",
                "inside": "The refined residue-pair representation carries the relational context used by the Structure Module and recycling."
              }
            }
          },
          {
            "id": "projection_e210b14944a7",
            "from": "evoformer_stack",
            "to": "single_representation_after_evoformer",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.evoformer_projects_single_representation"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.evoformer_projects_single_representation"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_representation"
            ],
            "presentation": {
              "label": "target-row projection",
              "connection": {
                "title": "Single representation",
                "role": "per-residue structure input",
                "inside": "A learned projection of the final target MSA row produces one 384-channel feature vector per residue."
              }
            }
          },
          {
            "id": "projection_06a493b2bb22",
            "from": "genetic_database_search",
            "to": "multiple_sequence_alignment",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.genetic_search_produces_msa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.genetic_search_produces_msa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.msa_features"
            ],
            "presentation": {
              "label": "homologues",
              "connection": {
                "title": "Multiple-sequence alignment",
                "role": "evolutionary input",
                "inside": "Search hits are deduplicated and aligned with the target to expose evolutionary variation across residues."
              }
            }
          },
          {
            "id": "projection_98467a194303",
            "from": "input_embedder",
            "to": "msa_representation_before_evoformer",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.input_embedder_initializes_msa_representation"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.input_embedder_initializes_msa_representation"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.msa_representation"
            ],
            "presentation": {
              "label": "m",
              "connection": {
                "title": "Initial MSA representation",
                "role": "upper Evoformer track",
                "inside": "Embedded target, aligned-sequence, template-angle, and recycled target-row features form the MSA state."
              }
            }
          },
          {
            "id": "projection_3aa8c2212ca8",
            "from": "input_embedder",
            "to": "pair_representation_before_evoformer",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.input_embedder_initializes_pair_representation"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.input_embedder_initializes_pair_representation"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_representation"
            ],
            "presentation": {
              "label": "z",
              "connection": {
                "title": "Initial pair representation",
                "role": "lower Evoformer track",
                "inside": "Target pairing, relative positions, template geometry, extra-MSA updates, and recycled geometry form the pair state."
              }
            }
          },
          {
            "id": "projection_56a1f60a1c23",
            "from": "input_sequence",
            "to": "genetic_database_search",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.input_sequence_queries_genetic_database"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.input_sequence_queries_genetic_database"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.amino_acid_sequence"
            ],
            "presentation": {
              "label": "sequence",
              "connection": {
                "title": "Sequence to genetic search",
                "role": "evolutionary evidence query",
                "inside": "The target sequence launches searches across genetic databases for homologous sequences."
              }
            }
          },
          {
            "id": "projection_774182058375",
            "from": "input_sequence",
            "to": "sequence_pairing",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.input_sequence_enters_pairing"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.input_sequence_enters_pairing"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.amino_acid_sequence"
            ],
            "presentation": {
              "label": "target features",
              "connection": {
                "title": "Target pairing branch",
                "role": "pair-state initialization",
                "inside": "Target residue features and relative residue indices seed the ordered residue-pair representation."
              }
            }
          },
          {
            "id": "projection_bb01f3e2d839",
            "from": "input_sequence",
            "to": "structure_database_search",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.input_sequence_queries_structure_database"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.input_sequence_queries_structure_database"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.amino_acid_sequence"
            ],
            "presentation": {
              "label": "sequence-derived query",
              "connection": {
                "title": "Sequence to structure search",
                "role": "template lookup",
                "inside": "The target's sequence-derived alignment is used to retrieve and featurize structural homologues."
              }
            }
          },
          {
            "id": "projection_00a4441ff8b5",
            "from": "msa_representation_after_evoformer",
            "to": "recycling_embedder",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.processed_msa_supplies_recycled_first_row",
              "relations.recycled_msa_advances_to_next_iteration",
              "relations.recycled_msa_enters_recycling_embedder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.processed_msa_supplies_recycled_first_row"
              },
              {
                "relation_ref": "relations.recycled_msa_advances_to_next_iteration"
              },
              {
                "relation_ref": "relations.recycled_msa_enters_recycling_embedder"
              }
            ],
            "hidden_refs": [
              "value_sites.recycled_msa_after_iteration",
              "value_sites.recycled_msa_before_iteration"
            ],
            "carries": [
              "representations.msa_first_row"
            ],
            "presentation": {
              "label": "target MSA row",
              "route_side": "bottom",
              "route_clearance": 26,
              "connection": {
                "title": "Recycle target MSA row",
                "role": "previous evolutionary state",
                "inside": "The next execution receives a normalized copy of the previous Evoformer's first MSA row, not the derived single representation."
              }
            }
          },
          {
            "id": "projection_e2aa768b95f7",
            "from": "msa_representation_before_evoformer",
            "to": "evoformer_stack",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.initial_msa_enters_evoformer"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.initial_msa_enters_evoformer"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.msa_representation"
            ],
            "presentation": {
              "label": "m",
              "connection": {
                "title": "MSA track enters Evoformer",
                "role": "evolutionary state",
                "inside": "Every Evoformer block updates the MSA state and exchanges information with the pair state."
              }
            }
          },
          {
            "id": "projection_4b2f36065f1c",
            "from": "multiple_sequence_alignment",
            "to": "input_embedder",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.msa_features_enter_input_embedder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.msa_features_enter_input_embedder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.msa_features"
            ],
            "presentation": {
              "label": "MSA features",
              "connection": {
                "title": "MSA embedding",
                "role": "initialize evolutionary state",
                "inside": "Clustered MSA features initialize the main MSA track while extra sequences update the pair track through a shallow stack."
              }
            }
          },
          {
            "id": "projection_fd6d4e76665f",
            "from": "pair_representation_after_evoformer",
            "to": "recycling_embedder",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.processed_pair_supplies_recycled_pair",
              "relations.recycled_pair_advances_to_next_iteration",
              "relations.recycled_pair_enters_recycling_embedder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.processed_pair_supplies_recycled_pair"
              },
              {
                "relation_ref": "relations.recycled_pair_advances_to_next_iteration"
              },
              {
                "relation_ref": "relations.recycled_pair_enters_recycling_embedder"
              }
            ],
            "hidden_refs": [
              "value_sites.recycled_pair_after_iteration",
              "value_sites.recycled_pair_before_iteration"
            ],
            "carries": [
              "representations.pair_representation"
            ],
            "presentation": {
              "label": "pair state",
              "route_side": "bottom",
              "route_clearance": 40,
              "connection": {
                "title": "Recycle pair representation",
                "role": "previous relational state",
                "inside": "The complete final pair representation is normalized before contributing to the next pair input."
              }
            }
          },
          {
            "id": "projection_bb2b179034fa",
            "from": "pair_representation_after_evoformer",
            "to": "structure_module",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_representation_enters_structure_module"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_representation_enters_structure_module"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_representation"
            ],
            "presentation": {
              "label": "z",
              "connection": {
                "title": "Pairs into Structure Module",
                "role": "invariant point attention context",
                "inside": "The final pair representation biases residue-to-residue reasoning while the module constructs explicit 3D geometry."
              }
            }
          },
          {
            "id": "projection_02b89bacfe54",
            "from": "pair_representation_before_evoformer",
            "to": "evoformer_stack",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.initial_pair_enters_evoformer"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.initial_pair_enters_evoformer"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_representation"
            ],
            "presentation": {
              "label": "z",
              "connection": {
                "title": "Pair track enters Evoformer",
                "role": "residue-pair state",
                "inside": "Every Evoformer block refines residue-pair relationships through outer-product and triangular updates."
              }
            }
          },
          {
            "id": "projection_be0ee9245fbe",
            "from": "predicted_structure_output",
            "to": "recycling_embedder",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.predicted_structure_supplies_recycled_coordinates",
              "relations.recycled_coordinates_advance_to_next_iteration",
              "relations.recycled_coordinates_enter_recycling_embedder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.predicted_structure_supplies_recycled_coordinates"
              },
              {
                "relation_ref": "relations.recycled_coordinates_advance_to_next_iteration"
              },
              {
                "relation_ref": "relations.recycled_coordinates_enter_recycling_embedder"
              }
            ],
            "hidden_refs": [
              "value_sites.recycled_coordinates_after_iteration",
              "value_sites.recycled_coordinates_before_iteration"
            ],
            "carries": [
              "representations.pseudo_beta_coordinates"
            ],
            "presentation": {
              "label": "pseudo-beta geometry",
              "route_side": "bottom",
              "route_clearance": 54,
              "connection": {
                "title": "Recycle predicted geometry",
                "role": "previous structure state",
                "inside": "Previous pseudo-beta distances are binned and projected into a pair-representation update for the next execution."
              }
            }
          },
          {
            "id": "projection_52f0d2f1cbed",
            "from": "recycling_embedder",
            "to": "input_embedder",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.recycling_embedder_produces_msa_update",
              "relations.msa_recycle_update_conditions_input_embedder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.recycling_embedder_produces_msa_update"
              },
              {
                "relation_ref": "relations.msa_recycle_update_conditions_input_embedder"
              }
            ],
            "hidden_refs": [
              "value_sites.msa_recycle_update"
            ],
            "carries": [
              "representations.msa_first_row"
            ],
            "presentation": {
              "label": "recycled MSA",
              "route_side": "bottom",
              "route_clearance": 66,
              "connection": {
                "title": "Inject recycled MSA state",
                "role": "additive target-row update",
                "inside": "The normalized previous target row is added to the newly embedded first MSA row."
              }
            }
          },
          {
            "id": "projection_13a68d2b7e4b",
            "from": "recycling_embedder",
            "to": "input_embedder",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.recycling_embedder_produces_pair_update",
              "relations.pair_recycle_update_conditions_input_embedder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.recycling_embedder_produces_pair_update"
              },
              {
                "relation_ref": "relations.pair_recycle_update_conditions_input_embedder"
              }
            ],
            "hidden_refs": [
              "value_sites.pair_recycle_update"
            ],
            "carries": [
              "representations.pair_representation"
            ],
            "presentation": {
              "label": "recycled pair + distances",
              "route_side": "bottom",
              "route_clearance": 82,
              "connection": {
                "title": "Inject recycled pair state",
                "role": "additive pair update",
                "inside": "The normalized previous pair state and the embedded previous distance map are added to the new pair representation."
              }
            }
          },
          {
            "id": "projection_1aed0c9bfb84",
            "from": "sequence_pairing",
            "to": "input_embedder",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.sequence_pairing_produces_target_pair_features",
              "relations.target_pair_features_enter_input_embedder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.sequence_pairing_produces_target_pair_features"
              },
              {
                "relation_ref": "relations.target_pair_features_enter_input_embedder"
              }
            ],
            "hidden_refs": [
              "value_sites.target_pair_features"
            ],
            "carries": [
              "representations.target_pair_features"
            ],
            "presentation": {
              "label": "target pair seed",
              "connection": {
                "title": "Target pair features",
                "role": "initial pair evidence",
                "inside": "Two projected target-feature tracks are combined by outer sum and augmented with clipped relative positions."
              }
            }
          },
          {
            "id": "projection_534e1ccb2c34",
            "from": "single_representation_after_evoformer",
            "to": "structure_module",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.single_representation_enters_structure_module"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_representation_enters_structure_module"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_representation"
            ],
            "presentation": {
              "label": "s",
              "connection": {
                "title": "Singles into Structure Module",
                "role": "mutable per-residue state",
                "inside": "The Structure Module repeatedly updates per-residue invariant features and rigid frames from the single representation."
              }
            }
          },
          {
            "id": "projection_13441ac9b809",
            "from": "structural_templates",
            "to": "input_embedder",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.templates_enter_input_embedder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.templates_enter_input_embedder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.template_features"
            ],
            "presentation": {
              "label": "template features",
              "connection": {
                "title": "Template integration",
                "role": "structure-derived input",
                "inside": "Template angle features extend the MSA track and template pair features add geometric evidence to the pair track."
              }
            }
          },
          {
            "id": "projection_bf7e6afb90c4",
            "from": "structure_database_search",
            "to": "structural_templates",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.structure_search_produces_templates"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.structure_search_produces_templates"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.template_features"
            ],
            "presentation": {
              "label": "structural hits",
              "connection": {
                "title": "Structural templates",
                "role": "known-structure evidence",
                "inside": "Template hits contribute residue, torsion, mask, and pair-geometry features to model input integration."
              }
            }
          },
          {
            "id": "projection_58100c267487",
            "from": "structure_module",
            "to": "predicted_structure_output",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.structure_module_predicts_structure_and_confidence"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.structure_module_predicts_structure_and_confidence"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.structure_prediction"
            ],
            "presentation": {
              "label": "coordinates + pLDDT",
              "connection": {
                "title": "Confidence-coloured structure",
                "role": "task boundary output",
                "inside": "Eight structure blocks refine residue frames, predict torsions, reconstruct all heavy atoms, and attach per-residue confidence."
              }
            }
          }
        ],
        "classifications": {
          "modules.evoformer_stack": "visible",
          "modules.genetic_database_search": "visible",
          "modules.input_embedder": "visible",
          "modules.recycling_embedder": "visible",
          "modules.sequence_pairing": "visible",
          "modules.structure_database_search": "visible",
          "modules.structure_module": "visible",
          "value_sites.input_sequence": "visible",
          "value_sites.msa_recycle_update": "elided",
          "value_sites.msa_representation_after_evoformer": "visible",
          "value_sites.msa_representation_before_evoformer": "visible",
          "value_sites.multiple_sequence_alignment": "visible",
          "value_sites.pair_recycle_update": "elided",
          "value_sites.pair_representation_after_evoformer": "visible",
          "value_sites.pair_representation_before_evoformer": "visible",
          "value_sites.predicted_structure_output": "visible",
          "value_sites.recycled_coordinates_after_iteration": "elided",
          "value_sites.recycled_coordinates_before_iteration": "elided",
          "value_sites.recycled_msa_after_iteration": "elided",
          "value_sites.recycled_msa_before_iteration": "elided",
          "value_sites.recycled_pair_after_iteration": "elided",
          "value_sites.recycled_pair_before_iteration": "elided",
          "value_sites.single_representation_after_evoformer": "visible",
          "value_sites.structural_templates": "visible",
          "value_sites.target_pair_features": "elided"
        },
        "projectionMode": "derived"
      }
    ]
  }
};
