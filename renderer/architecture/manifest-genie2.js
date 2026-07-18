export const manifest = {
  "schemaVersion": "architecture-manifest-v0.4",
  "build": {
    "generator": "architecture-manifest-builder-v0.4.1",
    "inputDigests": {
      "references/bibliography.yaml": "2c238cc39ff866cfb41c1b60c3e7a142df5707d3a9292efb8051aabbd5c8f336",
      "architectures/genie2.yaml": "cc0f6dea8ed2d6622590cc8da824921fdd9010203c29bab8b59ad7993087c514",
      "views/genie2-semantic-zoom.view.yaml": "3bef1fa640d8e2d0cb1654b6c145920f258ec40e8d8acd526017d1c5c72ea87e",
      "pseudocode/genie2.yaml": "b78ca953f8ebed98a688501d7485e3b2e79fb50b2e9434d876012c1ee4289bd0"
    }
  },
  "architecture": {
    "schemaVersion": "architecture-v0.4",
    "id": "genie2",
    "name": "Genie 2 Protein Backbone Diffusion",
    "family": "protein_structure_diffusion",
    "status": "draft",
    "taskModes": [
      "unconditional_backbone_generation",
      "motif_scaffolding"
    ],
    "referenceConfiguration": {
      "checkpoint": "base",
      "diffusion_steps": 1000,
      "single_feature_dimension": 384,
      "pair_feature_dimension": 128,
      "pair_transform_layers": 5,
      "triangular_multiplicative_update": true,
      "triangular_attention": false,
      "structure_layers": 8,
      "structure_recycles": 1,
      "ipa_heads": 12,
      "evidence": {
        "status": "confirmed_from_code",
        "refs": [
          {
            "source_ref": "genie2_config_code",
            "role": "implementation_evidence",
            "locator": "Config._create_config",
            "note": "The default model and diffusion dimensions define the released base architecture."
          },
          {
            "source_ref": "genie2_base_config",
            "role": "checkpoint_configuration",
            "locator": "full file",
            "note": "The released base checkpoint retains five pair-transform layers and uses motif-conditioned training examples."
          }
        ]
      }
    },
    "sourceYaml": "../../architectures/genie2.yaml",
    "sources": [
      {
        "source_ref": "genie2_2024",
        "role": "architecture_description"
      },
      {
        "source_ref": "genie2_model_code",
        "role": "reference_implementation"
      },
      {
        "source_ref": "genie2_sampler_code",
        "role": "reference_implementation"
      },
      {
        "source_ref": "genie2_training_code",
        "role": "training_implementation"
      }
    ],
    "decomposition": {
      "status": "complete",
      "evidence": {
        "status": "confirmed_from_code",
        "refs": [
          {
            "source_ref": "genie2_sampler_code",
            "role": "implementation_evidence",
            "locator": "BaseSampler.sample and BaseSampler._sample",
            "note": "Feature construction, reverse diffusion, and output postprocessing form the complete generation path represented at the task boundary."
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
          "immediateModuleCount": 3,
          "immediateModuleRefs": [
            "modules.feature_builder",
            "modules.reverse_diffusion_sampler",
            "modules.pdb_exporter"
          ]
        },
        "modules.feature_builder": {
          "status": "leaf",
          "depth": 1,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.reverse_diffusion_sampler": {
          "status": "complete",
          "depth": 1,
          "immediateModuleCount": 6,
          "immediateModuleRefs": [
            "modules.coordinate_initializer",
            "modules.timestep_controller",
            "modules.frenet_frame_builder",
            "modules.denoiser",
            "modules.step_noise_sampler",
            "modules.reverse_diffusion_update"
          ]
        },
        "modules.pdb_exporter": {
          "status": "leaf",
          "depth": 1,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.coordinate_initializer": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.timestep_controller": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.frenet_frame_builder": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.denoiser": {
          "status": "complete",
          "depth": 2,
          "immediateModuleCount": 3,
          "immediateModuleRefs": [
            "modules.invariant_feature_encoder",
            "modules.equivariant_structure_decoder",
            "modules.noise_readout"
          ]
        },
        "modules.step_noise_sampler": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.reverse_diffusion_update": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.invariant_feature_encoder": {
          "status": "complete",
          "depth": 3,
          "immediateModuleCount": 3,
          "immediateModuleRefs": [
            "modules.single_feature_net",
            "modules.pair_feature_net",
            "modules.pair_transform_stack"
          ]
        },
        "modules.equivariant_structure_decoder": {
          "status": "complete",
          "depth": 3,
          "immediateModuleCount": 3,
          "immediateModuleRefs": [
            "modules.invariant_point_attention",
            "modules.structure_transition",
            "modules.backbone_update"
          ]
        },
        "modules.noise_readout": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.single_feature_net": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.pair_feature_net": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.pair_transform_stack": {
          "status": "complete",
          "depth": 4,
          "immediateModuleCount": 3,
          "immediateModuleRefs": [
            "modules.triangle_multiplication_outgoing",
            "modules.triangle_multiplication_incoming",
            "modules.pair_transition"
          ]
        },
        "modules.triangle_multiplication_outgoing": {
          "status": "leaf",
          "depth": 5,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.triangle_multiplication_incoming": {
          "status": "leaf",
          "depth": 5,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.pair_transition": {
          "status": "leaf",
          "depth": 5,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.invariant_point_attention": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.structure_transition": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.backbone_update": {
          "status": "leaf",
          "depth": 4,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        }
      },
      "summary": {
        "scopeCount": 22,
        "expandedScopeCount": 6,
        "completeExpandedScopeCount": 6,
        "partialScopeCount": 0,
        "leafFrontierCount": 16,
        "opaqueFrontierCount": 0,
        "partialFrontierCount": 0,
        "maximumAuthoredDepth": 5
      },
      "opaqueFrontierRefs": [

      ],
      "partialScopeRefs": [

      ]
    },
    "modules": [
      {
        "id": "feature_builder",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Sampling Feature Builder",
        "kind": "adapter",
        "mechanisms": [
          "task_featurization"
        ],
        "role": "turn a target length or motif PDB specification into residue layout, masks, and optional motif sequence and geometry constraints",
        "scale": "mixed",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.create_np_features"
            }
          ]
        }
      },
      {
        "id": "reverse_diffusion_sampler",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "complete"
        },
        "label": "Genie 2 Reverse Diffusion",
        "kind": "sampler",
        "mechanisms": [
          "reverse_diffusion",
          "ddpm"
        ],
        "role": "initialize random C-alpha coordinates and run all 1000 denoising and posterior-update steps",
        "scale": "residue",
        "repeats": 1000,
        "pseudocode_ref": "../../pseudocode/genie2.yaml",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "pdb_exporter",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Backbone PDB Exporter",
        "kind": "serializer",
        "role": "write generated C-alpha coordinates as a sequence-agnostic backbone PDB and, for scaffolding, a residue-aligned motif PDB",
        "scale": "output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.on_sample_end"
            }
          ]
        }
      },
      {
        "id": "coordinate_initializer",
        "parent_ref": "modules.reverse_diffusion_sampler",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Gaussian Coordinate Initializer",
        "kind": "sampler",
        "mechanisms": [
          "gaussian_initialization"
        ],
        "role": "sample standard-normal C-alpha coordinates with the requested residue count",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "timestep_controller",
        "parent_ref": "modules.reverse_diffusion_sampler",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Reverse Timestep Controller",
        "kind": "controller",
        "mechanisms": [
          "timestep_schedule"
        ],
        "role": "enumerate diffusion steps from 1000 down to 1",
        "scale": "sample",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "frenet_frame_builder",
        "parent_ref": "modules.reverse_diffusion_sampler",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Frenet Frame Construction",
        "kind": "adapter",
        "mechanisms": [
          "frenet_frames"
        ],
        "role": "derive residue rotations from the current C-alpha trace and package them with the unchanged x_t translations for the denoiser",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "denoiser",
        "parent_ref": "modules.reverse_diffusion_sampler",
        "decomposition": {
          "status": "complete"
        },
        "label": "SE(3)-Equivariant Denoiser",
        "kind": "denoiser",
        "role": "map the current C-alpha trace packaged with its derived Frenet frames, timestep, and optional motif constraints to a per-residue noise prediction",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "step_noise_sampler",
        "parent_ref": "modules.reverse_diffusion_sampler",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Step Noise Sampler",
        "kind": "sampler",
        "mechanisms": [
          "gaussian_noise"
        ],
        "role": "draw fresh Gaussian translation noise for every nonfinal reverse step",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "reverse_diffusion_update",
        "parent_ref": "modules.reverse_diffusion_sampler",
        "decomposition": {
          "status": "leaf"
        },
        "label": "DDPM Coordinate Update",
        "kind": "operator",
        "mechanisms": [
          "ddpm"
        ],
        "role": "combine current C-alpha coordinates, predicted noise, schedule coefficients, and fresh noise into the next C-alpha coordinates",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "invariant_feature_encoder",
        "parent_ref": "modules.denoiser",
        "decomposition": {
          "status": "complete"
        },
        "label": "SE(3)-Invariant Feature Encoder",
        "kind": "encoder",
        "mechanisms": [
          "invariant_geometry"
        ],
        "role": "construct and refine residue and residue-pair states from indices, noisy-frame geometry, timestep, and optional motif constraints",
        "scale": "mixed",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "equivariant_structure_decoder",
        "parent_ref": "modules.denoiser",
        "decomposition": {
          "status": "complete"
        },
        "label": "SE(3)-Equivariant Structure Decoder",
        "kind": "refiner",
        "mechanisms": [
          "invariant_point_attention",
          "rigid_transform"
        ],
        "role": "use invariant point attention to update single features and compose learned rigid increments into the noisy residue frames",
        "scale": "residue",
        "repeats": 8,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet and StructureLayer"
            }
          ]
        }
      },
      {
        "id": "noise_readout",
        "parent_ref": "modules.denoiser",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Translation Displacement Readout",
        "kind": "operator",
        "mechanisms": [
          "vector_difference"
        ],
        "role": "subtract updated translations from the input noisy translations to obtain the predicted diffusion noise",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "single_feature_net",
        "parent_ref": "modules.invariant_feature_encoder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Single-Feature Network",
        "kind": "encoder",
        "role": "concatenate residue, chain, timestep, motif-sequence, and mask encodings and project them to 384-dimensional per-residue features",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_single_feature_code",
              "role": "implementation_evidence",
              "locator": "SingleFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "pair_feature_net",
        "parent_ref": "modules.invariant_feature_encoder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Pair-Feature Network",
        "kind": "encoder",
        "role": "combine the single-feature outer sum, relative positions, noisy-frame distances and orientations, and masked motif distances into 128-dimensional pair features",
        "scale": "pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "PairFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "pair_transform_stack",
        "parent_ref": "modules.invariant_feature_encoder",
        "decomposition": {
          "status": "complete"
        },
        "label": "Pair Transform Stack",
        "kind": "refiner",
        "mechanisms": [
          "triangular_multiplication"
        ],
        "role": "refine pair features through five residual layers of outgoing and incoming triangular multiplication followed by pair transition",
        "scale": "pair",
        "repeats": 5,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformNet and PairTransformLayer"
            },
            {
              "source_ref": "genie2_config_code",
              "role": "configuration_evidence",
              "locator": "Config._create_config"
            }
          ]
        }
      },
      {
        "id": "triangle_multiplication_outgoing",
        "parent_ref": "modules.pair_transform_stack",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Triangle Multiplication Outgoing",
        "kind": "operator",
        "mechanisms": [
          "triangular_multiplication"
        ],
        "role": "update each pair edge through outgoing two-edge paths and add the row-dropout result residually",
        "scale": "pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "triangle_multiplication_incoming",
        "parent_ref": "modules.pair_transform_stack",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Triangle Multiplication Incoming",
        "kind": "operator",
        "mechanisms": [
          "triangular_multiplication"
        ],
        "role": "update each pair edge through incoming two-edge paths and add the row-dropout result residually",
        "scale": "pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "pair_transition",
        "parent_ref": "modules.pair_transform_stack",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Pair Transition",
        "kind": "feed_forward",
        "role": "apply a pair-wise transition MLP and add its output residually",
        "scale": "pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "invariant_point_attention",
        "parent_ref": "modules.equivariant_structure_decoder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Invariant Point Attention",
        "kind": "attention",
        "mechanisms": [
          "invariant_point_attention"
        ],
        "role": "update the single state using single features, pair features, and query/key/value points expressed in current residue frames",
        "scale": "residue",
        "attention": {
          "pattern": "full",
          "query_scale": "residue",
          "key_value_scale": "residue",
          "heads": 12,
          "pair_bias": true,
          "pair_bias_source": "refined_pair_features",
          "positional_encoding": {
            "kind": "rigid_frame_points"
          }
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet and StructureLayer"
            }
          ]
        }
      },
      {
        "id": "structure_transition",
        "parent_ref": "modules.equivariant_structure_decoder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Structure Transition",
        "kind": "feed_forward",
        "role": "normalize and transform the IPA-updated per-residue single state",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet and StructureLayer"
            }
          ]
        }
      },
      {
        "id": "backbone_update",
        "parent_ref": "modules.equivariant_structure_decoder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Backbone Frame Update",
        "kind": "operator",
        "mechanisms": [
          "rigid_transform"
        ],
        "role": "project each residue state to a six-parameter rigid increment and compose it into the current frame",
        "scale": "residue",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureNet and StructureLayer"
            }
          ]
        }
      }
    ],
    "representations": [
      {
        "id": "generation_request",
        "scale": "sample",
        "semantic_role": "requested backbone length or motif-scaffolding specification",
        "shape": "B x request fields",
        "carries": [
          "target residue count",
          "optional motif PDB segments and scaffold placement ranges"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.setup and ScaffoldSampler.create_np_features"
            }
          ]
        }
      },
      {
        "id": "feature_bundle",
        "scale": "mixed",
        "semantic_role": "residue layout, masks, and optional motif sequence and structure constraints",
        "shape": "B x N fields + B x N x N masks",
        "carries": [
          "residue and chain indices",
          "residue mask",
          "motif amino-acid identities and fixed-sequence mask",
          "motif C-alpha coordinates and fixed-structure mask"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward features argument"
            }
          ]
        }
      },
      {
        "id": "ca_coordinates",
        "scale": "residue",
        "semantic_role": "C-alpha coordinate trace used as the forward and reverse diffusion state",
        "shape": "B x N x 3",
        "carries": [
          "one C-alpha translation per residue"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_training_code",
              "role": "implementation_evidence",
              "locator": "Genie.training_step"
            },
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        },
        "glyph": "coordinates"
      },
      {
        "id": "residue_frames",
        "scale": "residue",
        "semantic_role": "derived per-residue rigid frames whose translations are C-alpha coordinates and whose rotations are reconstructed from the trace",
        "shape": "B x N x (3 x 3 + 3)",
        "carries": [
          "frame rotations",
          "C-alpha translations"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        },
        "glyph": "frames"
      },
      {
        "id": "timestep",
        "scale": "sample",
        "semantic_role": "current diffusion step",
        "shape": "B",
        "carries": [
          "noise level from 1 through 1000"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "coordinate_noise",
        "scale": "residue",
        "semantic_role": "sampled or predicted C-alpha translation noise",
        "shape": "B x N x 3",
        "carries": [
          "one three-vector per residue"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_training_code",
              "role": "implementation_evidence",
              "locator": "Genie.training_step"
            }
          ]
        }
      },
      {
        "id": "single_features",
        "scale": "residue",
        "semantic_role": "SE(3)-invariant per-residue latent state",
        "shape": "B x N x 384",
        "carries": [
          "residue and chain position",
          "diffusion timestep",
          "masked motif sequence identity"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_single_feature_code",
              "role": "implementation_evidence",
              "locator": "SingleFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "pair_features",
        "scale": "pair",
        "semantic_role": "SE(3)-invariant residue-pair latent state",
        "shape": "B x N x N x 128",
        "carries": [
          "single-feature outer sum",
          "relative sequence position and chain identity",
          "noisy-frame distances and orientations",
          "masked motif distances"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "PairFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "backbone_pdb",
        "scale": "output",
        "semantic_role": "serialized generated backbone structure",
        "shape": "N x C-alpha records",
        "carries": [
          "generated coordinates with alanine placeholder residue types outside fixed motifs"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.on_sample_end"
            }
          ]
        }
      }
    ],
    "valueSites": [
      {
        "id": "generation_request",
        "representation_ref": "representations.generation_request",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "task_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.create_np_features"
            }
          ]
        }
      },
      {
        "id": "feature_bundle",
        "representation_ref": "representations.feature_bundle",
        "scope_ref": "architecture",
        "role": "prepared_conditioning",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "initial_coordinates",
        "representation_ref": "representations.ca_coordinates",
        "scope_ref": "modules.reverse_diffusion_sampler",
        "role": "initial_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "current_coordinates",
        "representation_ref": "representations.ca_coordinates",
        "scope_ref": "modules.reverse_diffusion_sampler",
        "role": "state_read",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "current_frames",
        "representation_ref": "representations.residue_frames",
        "scope_ref": "modules.denoiser",
        "role": "derived_model_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "timestep",
        "representation_ref": "representations.timestep",
        "scope_ref": "modules.reverse_diffusion_sampler",
        "role": "loop_control",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "fresh_step_noise",
        "representation_ref": "representations.coordinate_noise",
        "scope_ref": "modules.reverse_diffusion_sampler",
        "role": "stochastic_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "predicted_noise",
        "representation_ref": "representations.coordinate_noise",
        "scope_ref": "modules.reverse_diffusion_sampler",
        "role": "model_prediction",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "next_coordinates",
        "representation_ref": "representations.ca_coordinates",
        "scope_ref": "modules.reverse_diffusion_sampler",
        "role": "state_write",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "single_features",
        "representation_ref": "representations.single_features",
        "scope_ref": "modules.invariant_feature_encoder",
        "role": "encoder_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "initial_pair_features",
        "representation_ref": "representations.pair_features",
        "scope_ref": "modules.invariant_feature_encoder",
        "role": "pair_state_before_refinement",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "pair_after_outgoing",
        "representation_ref": "representations.pair_features",
        "scope_ref": "modules.pair_transform_stack",
        "role": "pair_state_after_outgoing_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "pair_after_incoming",
        "representation_ref": "representations.pair_features",
        "scope_ref": "modules.pair_transform_stack",
        "role": "pair_state_after_incoming_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "refined_pair_features",
        "representation_ref": "representations.pair_features",
        "scope_ref": "modules.invariant_feature_encoder",
        "role": "encoder_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "single_after_ipa",
        "representation_ref": "representations.single_features",
        "scope_ref": "modules.equivariant_structure_decoder",
        "role": "attention_updated_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "single_after_transition",
        "representation_ref": "representations.single_features",
        "scope_ref": "modules.equivariant_structure_decoder",
        "role": "transition_updated_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "updated_frames",
        "representation_ref": "representations.residue_frames",
        "scope_ref": "modules.denoiser",
        "role": "denoised_frame_estimate",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "final_coordinates",
        "representation_ref": "representations.ca_coordinates",
        "scope_ref": "architecture",
        "role": "sampler_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "generated_backbone_pdb",
        "representation_ref": "representations.backbone_pdb",
        "scope_ref": "architecture",
        "boundary": "output",
        "role": "task_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      }
    ],
    "valueSiteInterfaces": {
      "generation_request": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.generation_request_enters_feature_builder"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.feature_builder"
        ]
      },
      "feature_bundle": {
        "incomingRelationRefs": [
          "relations.feature_builder_produces_feature_bundle"
        ],
        "outgoingRelationRefs": [
          "relations.feature_bundle_sets_initial_coordinate_shape",
          "relations.feature_bundle_conditions_frenet_frame_builder",
          "relations.feature_bundle_conditions_single_feature_net",
          "relations.feature_bundle_conditions_pair_feature_net",
          "relations.feature_bundle_masks_ipa"
        ],
        "producerRefs": [
          "modules.feature_builder"
        ],
        "consumerRefs": [
          "modules.coordinate_initializer",
          "modules.frenet_frame_builder",
          "modules.single_feature_net",
          "modules.pair_feature_net",
          "modules.invariant_point_attention"
        ]
      },
      "initial_coordinates": {
        "incomingRelationRefs": [
          "relations.coordinate_initializer_produces_initial_coordinates"
        ],
        "outgoingRelationRefs": [
          "relations.initial_coordinates_begin_sampling_state"
        ],
        "producerRefs": [
          "modules.coordinate_initializer"
        ],
        "consumerRefs": [
          "value_sites.current_coordinates"
        ]
      },
      "current_coordinates": {
        "incomingRelationRefs": [
          "relations.initial_coordinates_begin_sampling_state",
          "relations.next_coordinates_reenter_sampling_state"
        ],
        "outgoingRelationRefs": [
          "relations.current_coordinates_enter_frenet_frame_builder",
          "relations.current_coordinates_enter_reverse_update"
        ],
        "producerRefs": [
          "value_sites.initial_coordinates",
          "value_sites.next_coordinates"
        ],
        "consumerRefs": [
          "modules.frenet_frame_builder",
          "modules.reverse_diffusion_update"
        ]
      },
      "current_frames": {
        "incomingRelationRefs": [
          "relations.frenet_frame_builder_produces_current_frames"
        ],
        "outgoingRelationRefs": [
          "relations.current_frames_enter_pair_feature_net",
          "relations.current_frames_condition_ipa",
          "relations.current_frames_enter_backbone_update",
          "relations.current_frames_enter_noise_readout"
        ],
        "producerRefs": [
          "modules.frenet_frame_builder"
        ],
        "consumerRefs": [
          "modules.pair_feature_net",
          "modules.invariant_point_attention",
          "modules.backbone_update",
          "modules.noise_readout"
        ]
      },
      "timestep": {
        "incomingRelationRefs": [
          "relations.timestep_controller_produces_timestep"
        ],
        "outgoingRelationRefs": [
          "relations.timestep_conditions_single_feature_net",
          "relations.timestep_enters_reverse_update"
        ],
        "producerRefs": [
          "modules.timestep_controller"
        ],
        "consumerRefs": [
          "modules.single_feature_net",
          "modules.reverse_diffusion_update"
        ]
      },
      "fresh_step_noise": {
        "incomingRelationRefs": [
          "relations.step_noise_sampler_produces_fresh_noise"
        ],
        "outgoingRelationRefs": [
          "relations.fresh_noise_enters_reverse_update"
        ],
        "producerRefs": [
          "modules.step_noise_sampler"
        ],
        "consumerRefs": [
          "modules.reverse_diffusion_update"
        ]
      },
      "predicted_noise": {
        "incomingRelationRefs": [
          "relations.noise_readout_produces_predicted_noise"
        ],
        "outgoingRelationRefs": [
          "relations.predicted_noise_enters_reverse_update"
        ],
        "producerRefs": [
          "modules.noise_readout"
        ],
        "consumerRefs": [
          "modules.reverse_diffusion_update"
        ]
      },
      "next_coordinates": {
        "incomingRelationRefs": [
          "relations.reverse_update_produces_next_coordinates"
        ],
        "outgoingRelationRefs": [
          "relations.next_coordinates_reenter_sampling_state",
          "relations.terminal_coordinates_become_final_coordinates"
        ],
        "producerRefs": [
          "modules.reverse_diffusion_update"
        ],
        "consumerRefs": [
          "value_sites.current_coordinates",
          "value_sites.final_coordinates"
        ]
      },
      "single_features": {
        "incomingRelationRefs": [
          "relations.single_feature_net_produces_single_features"
        ],
        "outgoingRelationRefs": [
          "relations.single_features_feed_pair_feature_net",
          "relations.single_features_enter_ipa"
        ],
        "producerRefs": [
          "modules.single_feature_net"
        ],
        "consumerRefs": [
          "modules.pair_feature_net",
          "modules.invariant_point_attention"
        ]
      },
      "initial_pair_features": {
        "incomingRelationRefs": [
          "relations.pair_feature_net_produces_initial_pair_features"
        ],
        "outgoingRelationRefs": [
          "relations.initial_pair_features_enter_outgoing_update"
        ],
        "producerRefs": [
          "modules.pair_feature_net"
        ],
        "consumerRefs": [
          "modules.triangle_multiplication_outgoing"
        ]
      },
      "pair_after_outgoing": {
        "incomingRelationRefs": [
          "relations.outgoing_update_produces_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.pair_state_enters_incoming_update"
        ],
        "producerRefs": [
          "modules.triangle_multiplication_outgoing"
        ],
        "consumerRefs": [
          "modules.triangle_multiplication_incoming"
        ]
      },
      "pair_after_incoming": {
        "incomingRelationRefs": [
          "relations.incoming_update_produces_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.pair_state_enters_pair_transition"
        ],
        "producerRefs": [
          "modules.triangle_multiplication_incoming"
        ],
        "consumerRefs": [
          "modules.pair_transition"
        ]
      },
      "refined_pair_features": {
        "incomingRelationRefs": [
          "relations.pair_transition_produces_refined_pair_features"
        ],
        "outgoingRelationRefs": [
          "relations.refined_pair_features_bias_ipa"
        ],
        "producerRefs": [
          "modules.pair_transition"
        ],
        "consumerRefs": [
          "modules.invariant_point_attention"
        ]
      },
      "single_after_ipa": {
        "incomingRelationRefs": [
          "relations.ipa_produces_updated_single_state"
        ],
        "outgoingRelationRefs": [
          "relations.ipa_state_enters_structure_transition"
        ],
        "producerRefs": [
          "modules.invariant_point_attention"
        ],
        "consumerRefs": [
          "modules.structure_transition"
        ]
      },
      "single_after_transition": {
        "incomingRelationRefs": [
          "relations.structure_transition_produces_single_state"
        ],
        "outgoingRelationRefs": [
          "relations.single_state_enters_backbone_update"
        ],
        "producerRefs": [
          "modules.structure_transition"
        ],
        "consumerRefs": [
          "modules.backbone_update"
        ]
      },
      "updated_frames": {
        "incomingRelationRefs": [
          "relations.backbone_update_produces_updated_frames"
        ],
        "outgoingRelationRefs": [
          "relations.updated_frames_enter_noise_readout"
        ],
        "producerRefs": [
          "modules.backbone_update"
        ],
        "consumerRefs": [
          "modules.noise_readout"
        ]
      },
      "final_coordinates": {
        "incomingRelationRefs": [
          "relations.terminal_coordinates_become_final_coordinates"
        ],
        "outgoingRelationRefs": [
          "relations.final_coordinates_enter_pdb_exporter"
        ],
        "producerRefs": [
          "value_sites.next_coordinates"
        ],
        "consumerRefs": [
          "modules.pdb_exporter"
        ]
      },
      "generated_backbone_pdb": {
        "incomingRelationRefs": [
          "relations.pdb_exporter_writes_backbone_pdb"
        ],
        "outgoingRelationRefs": [

        ],
        "producerRefs": [
          "modules.pdb_exporter"
        ],
        "consumerRefs": [

        ]
      }
    },
    "execution": {
      "loops": [
        {
          "id": "reverse_diffusion_loop",
          "repeats": 1000,
          "reruns": [
            "modules.timestep_controller",
            "modules.frenet_frame_builder",
            "modules.denoiser",
            "modules.step_noise_sampler",
            "modules.reverse_diffusion_update"
          ],
          "cached": [
            "value_sites.feature_bundle"
          ],
          "notes": [
            "The same residue layout and optional motif constraints are reused for every reverse step.",
            "Each step rebuilds Frenet frames from the current C-alpha translations before the next denoiser call.",
            "Fresh Gaussian step noise is added for steps 1000 through 2; step 1 uses the posterior mean directly."
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie2_sampler_code",
                "role": "implementation_evidence",
                "locator": "BaseSampler._sample",
                "note": "The sampler iterates over reversed timesteps, calls the denoiser, applies the posterior formula, and reconstructs Frenet frames."
              }
            ]
          }
        },
        {
          "id": "pair_refinement_stack",
          "repeats": 5,
          "reruns": [
            "modules.triangle_multiplication_outgoing",
            "modules.triangle_multiplication_incoming",
            "modules.pair_transition"
          ],
          "cached": [

          ],
          "notes": [
            "The released base configuration enables both triangular multiplicative updates and disables triangular attention."
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie2_pair_transform_code",
                "role": "implementation_evidence",
                "locator": "PairTransformNet and PairTransformLayer"
              },
              {
                "source_ref": "genie2_config_code",
                "role": "configuration_evidence",
                "locator": "Config._create_config"
              }
            ]
          }
        },
        {
          "id": "structure_refinement_stack",
          "repeats": 8,
          "reruns": [
            "modules.invariant_point_attention",
            "modules.structure_transition",
            "modules.backbone_update"
          ],
          "cached": [
            "value_sites.refined_pair_features"
          ],
          "notes": [
            "Each structure layer updates the single state and composes a learned rigid-frame increment into the current frames."
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie2_structure_code",
                "role": "implementation_evidence",
                "locator": "StructureLayer.forward and StructureNet.forward"
              }
            ]
          }
        }
      ]
    },
    "stateSemantics": {
      "diffusion_coordinates": {
        "representation_ref": "representations.ca_coordinates",
        "value_site_refs": [
          "value_sites.initial_coordinates",
          "value_sites.current_coordinates",
          "value_sites.next_coordinates"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "C-alpha translations are the stochastic diffusion state; Frenet rotations are deterministically reconstructed from the current trace.",
          "Distinct initial, current, and next sites avoid representing the reverse chain as an ambiguous self-edge."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      "denoiser_frames": {
        "representation_ref": "representations.residue_frames",
        "value_site_refs": [
          "value_sites.current_frames",
          "value_sites.updated_frames"
        ],
        "lifecycle": "derived_and_transformed_within_denoiser",
        "notes": [
          "Current frames package x_t translations with Frenet rotations derived from x_t; they are not an independently diffused state.",
          "The structure decoder composes learned rigid increments into this derived frame representation before the noise readout compares translations."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            },
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      "pair_state": {
        "representation_ref": "representations.pair_features",
        "value_site_refs": [
          "value_sites.initial_pair_features",
          "value_sites.pair_after_outgoing",
          "value_sites.pair_after_incoming",
          "value_sites.refined_pair_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      "conditioning_features": {
        "representation_ref": "representations.feature_bundle",
        "value_site_refs": [
          "value_sites.feature_bundle"
        ],
        "lifecycle": "read_only_across_sampling",
        "notes": [
          "The bundle carries residue layout plus optional motif sequence and intra-motif geometry constraints."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            },
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.create_np_features"
            }
          ]
        }
      }
    },
    "stateSemanticsBySite": {
      "initial_coordinates": {
        "representation_ref": "representations.ca_coordinates",
        "value_site_refs": [
          "value_sites.initial_coordinates",
          "value_sites.current_coordinates",
          "value_sites.next_coordinates"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "C-alpha translations are the stochastic diffusion state; Frenet rotations are deterministically reconstructed from the current trace.",
          "Distinct initial, current, and next sites avoid representing the reverse chain as an ambiguous self-edge."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        },
        "groupId": "diffusion_coordinates"
      },
      "current_coordinates": {
        "representation_ref": "representations.ca_coordinates",
        "value_site_refs": [
          "value_sites.initial_coordinates",
          "value_sites.current_coordinates",
          "value_sites.next_coordinates"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "C-alpha translations are the stochastic diffusion state; Frenet rotations are deterministically reconstructed from the current trace.",
          "Distinct initial, current, and next sites avoid representing the reverse chain as an ambiguous self-edge."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        },
        "groupId": "diffusion_coordinates"
      },
      "next_coordinates": {
        "representation_ref": "representations.ca_coordinates",
        "value_site_refs": [
          "value_sites.initial_coordinates",
          "value_sites.current_coordinates",
          "value_sites.next_coordinates"
        ],
        "lifecycle": "iterative_loop_state",
        "notes": [
          "C-alpha translations are the stochastic diffusion state; Frenet rotations are deterministically reconstructed from the current trace.",
          "Distinct initial, current, and next sites avoid representing the reverse chain as an ambiguous self-edge."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        },
        "groupId": "diffusion_coordinates"
      },
      "current_frames": {
        "representation_ref": "representations.residue_frames",
        "value_site_refs": [
          "value_sites.current_frames",
          "value_sites.updated_frames"
        ],
        "lifecycle": "derived_and_transformed_within_denoiser",
        "notes": [
          "Current frames package x_t translations with Frenet rotations derived from x_t; they are not an independently diffused state.",
          "The structure decoder composes learned rigid increments into this derived frame representation before the noise readout compares translations."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            },
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        },
        "groupId": "denoiser_frames"
      },
      "updated_frames": {
        "representation_ref": "representations.residue_frames",
        "value_site_refs": [
          "value_sites.current_frames",
          "value_sites.updated_frames"
        ],
        "lifecycle": "derived_and_transformed_within_denoiser",
        "notes": [
          "Current frames package x_t translations with Frenet rotations derived from x_t; they are not an independently diffused state.",
          "The structure decoder composes learned rigid increments into this derived frame representation before the noise readout compares translations."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            },
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        },
        "groupId": "denoiser_frames"
      },
      "initial_pair_features": {
        "representation_ref": "representations.pair_features",
        "value_site_refs": [
          "value_sites.initial_pair_features",
          "value_sites.pair_after_outgoing",
          "value_sites.pair_after_incoming",
          "value_sites.refined_pair_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "pair_after_outgoing": {
        "representation_ref": "representations.pair_features",
        "value_site_refs": [
          "value_sites.initial_pair_features",
          "value_sites.pair_after_outgoing",
          "value_sites.pair_after_incoming",
          "value_sites.refined_pair_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "pair_after_incoming": {
        "representation_ref": "representations.pair_features",
        "value_site_refs": [
          "value_sites.initial_pair_features",
          "value_sites.pair_after_outgoing",
          "value_sites.pair_after_incoming",
          "value_sites.refined_pair_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "refined_pair_features": {
        "representation_ref": "representations.pair_features",
        "value_site_refs": [
          "value_sites.initial_pair_features",
          "value_sites.pair_after_outgoing",
          "value_sites.pair_after_incoming",
          "value_sites.refined_pair_features"
        ],
        "lifecycle": "transformed_within_denoiser",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "feature_bundle": {
        "representation_ref": "representations.feature_bundle",
        "value_site_refs": [
          "value_sites.feature_bundle"
        ],
        "lifecycle": "read_only_across_sampling",
        "notes": [
          "The bundle carries residue layout plus optional motif sequence and intra-motif geometry constraints."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            },
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.create_np_features"
            }
          ]
        },
        "groupId": "conditioning_features"
      }
    },
    "conditioning": [
      {
        "id": "motif_sequence_conditioning",
        "relation_ref": "relations.feature_bundle_conditions_single_feature_net",
        "mode": "masked_motif_sequence",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_single_feature_code",
              "role": "implementation_evidence",
              "locator": "SingleFeatureNet.forward",
              "note": "Motif amino-acid one-hot features are multiplied by fixed_sequence_mask before concatenation."
            }
          ]
        },
        "source": "value_sites.feature_bundle",
        "target": "modules.single_feature_net"
      },
      {
        "id": "motif_geometry_conditioning",
        "relation_ref": "relations.feature_bundle_conditions_pair_feature_net",
        "mode": "masked_intra_motif_distances",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "PairFeatureNet.forward",
              "note": "Motif C-alpha distance bins are gated by fixed_structure_mask before projection into pair features."
            }
          ]
        },
        "source": "value_sites.feature_bundle",
        "target": "modules.pair_feature_net"
      },
      {
        "id": "pair_conditioned_structure_attention",
        "relation_ref": "relations.refined_pair_features_bias_ipa",
        "mode": "pair_bias",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward",
              "note": "IPA consumes the pair representation alongside single features and current frames."
            }
          ]
        },
        "source": "value_sites.refined_pair_features",
        "target": "modules.invariant_point_attention"
      },
      {
        "id": "frame_conditioned_structure_attention",
        "relation_ref": "relations.current_frames_condition_ipa",
        "mode": "invariant_point_geometry",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        },
        "source": "value_sites.current_frames",
        "target": "modules.invariant_point_attention"
      }
    ],
    "scaleTransitions": [
      {
        "id": "single_to_pair_expansion",
        "relation_path": [
          "relations.single_features_feed_pair_feature_net",
          "relations.pair_feature_net_produces_initial_pair_features"
        ],
        "aggregation": "outer_sum_and_pair_geometry",
        "copy_vs_pool": "expand",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "PairFeatureNet.forward",
              "note": "Projected residue i and j features are outer-summed into an N by N pair state, then geometric and relative-position terms are added."
            }
          ]
        },
        "source": "value_sites.single_features",
        "target": "value_sites.initial_pair_features",
        "from_scale": "residue",
        "to_scale": "pair",
        "projection_refs": [
          "modules.pair_feature_net"
        ]
      },
      {
        "id": "coordinates_to_pdb_records",
        "relation_path": [
          "relations.final_coordinates_enter_pdb_exporter",
          "relations.pdb_exporter_writes_backbone_pdb"
        ],
        "aggregation": "serialize_ca_records",
        "copy_vs_pool": "copy",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.on_sample_end"
            }
          ]
        },
        "source": "value_sites.final_coordinates",
        "target": "value_sites.generated_backbone_pdb",
        "from_scale": "residue",
        "to_scale": "output",
        "projection_refs": [
          "modules.pdb_exporter"
        ]
      }
    ],
    "trainingInference": {
      "objective": {
        "kind": "coordinate_noise_prediction",
        "notes": [
          "Training minimizes motif-weighted per-residue mean squared error between predicted and sampled C-alpha translation noise.",
          "The released base configuration uses a motif probability of 1.0, while the model still supports unconditional inference through empty conditioning masks."
        ]
      },
      "schedule": {
        "kind": "cosine_variance",
        "steps": 1000
      },
      "sampler": {
        "kind": "ddpm",
        "steps": 1000,
        "configurable": false,
        "base_schedule_steps": 1000,
        "timestep_selection": "full_reverse_chain",
        "initial_state": "standard_normal_ca_coordinates",
        "guidance": "none",
        "update": "fixed_variance_posterior",
        "clip_denoised": false
      },
      "teacher_forcing": "not_applicable",
      "self_conditioning": "none",
      "checkpoint_notes": [
        "Genie 2 is sequence-agnostic at generation time; non-motif output residues are written with alanine placeholders.",
        "The sampler's scale parameter multiplies the Gaussian term in each nonfinal reverse step; the README recommends different values for unconditional generation and motif scaffolding.",
        "The base architecture uses triangular multiplicative updates but not triangular attention."
      ],
      "evidence": {
        "status": "confirmed_from_code",
        "refs": [
          {
            "source_ref": "genie2_training_code",
            "role": "implementation_evidence",
            "locator": "Genie.training_step"
          },
          {
            "source_ref": "genie2_sampler_code",
            "role": "implementation_evidence",
            "locator": "BaseSampler._sample"
          },
          {
            "source_ref": "genie2_config_code",
            "role": "configuration_evidence",
            "locator": "Config._create_config"
          }
        ]
      }
    },
    "relations": [
      {
        "id": "generation_request_enters_feature_builder",
        "from": "value_sites.generation_request",
        "to": "modules.feature_builder",
        "kind": "data_flow",
        "carries": [
          "representations.generation_request"
        ],
        "operation": "parse_generation_request",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.create_np_features"
            }
          ]
        }
      },
      {
        "id": "feature_builder_produces_feature_bundle",
        "from": "modules.feature_builder",
        "to": "value_sites.feature_bundle",
        "kind": "data_flow",
        "carries": [
          "representations.feature_bundle"
        ],
        "operation": "build_sampling_features",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.create_np_features"
            }
          ]
        }
      },
      {
        "id": "feature_bundle_sets_initial_coordinate_shape",
        "from": "value_sites.feature_bundle",
        "to": "modules.coordinate_initializer",
        "kind": "conditioning",
        "carries": [
          "representations.feature_bundle"
        ],
        "operation": "size_random_coordinate_tensor",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "coordinate_initializer_produces_initial_coordinates",
        "from": "modules.coordinate_initializer",
        "to": "value_sites.initial_coordinates",
        "kind": "state_update",
        "carries": [
          "representations.ca_coordinates"
        ],
        "operation": "sample_gaussian_ca_coordinates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "initial_coordinates_begin_sampling_state",
        "from": "value_sites.initial_coordinates",
        "to": "value_sites.current_coordinates",
        "kind": "state_update",
        "carries": [
          "representations.ca_coordinates"
        ],
        "operation": "initialize_reverse_chain",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "current_coordinates_enter_frenet_frame_builder",
        "from": "value_sites.current_coordinates",
        "to": "modules.frenet_frame_builder",
        "kind": "data_flow",
        "carries": [
          "representations.ca_coordinates"
        ],
        "operation": "provide_current_ca_trace",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "feature_bundle_conditions_frenet_frame_builder",
        "from": "value_sites.feature_bundle",
        "to": "modules.frenet_frame_builder",
        "kind": "conditioning",
        "carries": [
          "representations.feature_bundle"
        ],
        "operation": "provide_chain_indices_and_residue_mask",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "frenet_frame_builder_produces_current_frames",
        "from": "modules.frenet_frame_builder",
        "to": "value_sites.current_frames",
        "kind": "data_flow",
        "carries": [
          "representations.residue_frames"
        ],
        "operation": "derive_frenet_rotations_and_package_frames",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "timestep_controller_produces_timestep",
        "from": "modules.timestep_controller",
        "to": "value_sites.timestep",
        "kind": "control",
        "carries": [
          "representations.timestep"
        ],
        "operation": "enumerate_reverse_timestep",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "feature_bundle_conditions_single_feature_net",
        "from": "value_sites.feature_bundle",
        "to": "modules.single_feature_net",
        "kind": "conditioning",
        "carries": [
          "representations.feature_bundle"
        ],
        "operation": "provide_layout_and_masked_sequence",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_single_feature_code",
              "role": "implementation_evidence",
              "locator": "SingleFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "timestep_conditions_single_feature_net",
        "from": "value_sites.timestep",
        "to": "modules.single_feature_net",
        "kind": "conditioning",
        "carries": [
          "representations.timestep"
        ],
        "operation": "sinusoidal_timestep_encoding",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_single_feature_code",
              "role": "implementation_evidence",
              "locator": "SingleFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "single_feature_net_produces_single_features",
        "from": "modules.single_feature_net",
        "to": "value_sites.single_features",
        "kind": "data_flow",
        "carries": [
          "representations.single_features"
        ],
        "operation": "concatenate_and_project",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_single_feature_code",
              "role": "implementation_evidence",
              "locator": "SingleFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "single_features_feed_pair_feature_net",
        "from": "value_sites.single_features",
        "to": "modules.pair_feature_net",
        "kind": "data_flow",
        "carries": [
          "representations.single_features"
        ],
        "operation": "project_outer_sum",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "PairFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "current_frames_enter_pair_feature_net",
        "from": "value_sites.current_frames",
        "to": "modules.pair_feature_net",
        "kind": "data_flow",
        "carries": [
          "representations.residue_frames"
        ],
        "operation": "encode_noisy_frame_geometry",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "PairFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "feature_bundle_conditions_pair_feature_net",
        "from": "value_sites.feature_bundle",
        "to": "modules.pair_feature_net",
        "kind": "conditioning",
        "carries": [
          "representations.feature_bundle"
        ],
        "operation": "provide_relative_positions_and_masked_motif_geometry",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "PairFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "pair_feature_net_produces_initial_pair_features",
        "from": "modules.pair_feature_net",
        "to": "value_sites.initial_pair_features",
        "kind": "data_flow",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "sum_projected_pair_terms",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_feature_code",
              "role": "implementation_evidence",
              "locator": "PairFeatureNet.forward"
            }
          ]
        }
      },
      {
        "id": "initial_pair_features_enter_outgoing_update",
        "from": "value_sites.initial_pair_features",
        "to": "modules.triangle_multiplication_outgoing",
        "kind": "data_flow",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "triangular_multiplication_outgoing",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "outgoing_update_produces_pair_state",
        "from": "modules.triangle_multiplication_outgoing",
        "to": "value_sites.pair_after_outgoing",
        "kind": "state_update",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "residual_pair_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "pair_state_enters_incoming_update",
        "from": "value_sites.pair_after_outgoing",
        "to": "modules.triangle_multiplication_incoming",
        "kind": "data_flow",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "triangular_multiplication_incoming",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "incoming_update_produces_pair_state",
        "from": "modules.triangle_multiplication_incoming",
        "to": "value_sites.pair_after_incoming",
        "kind": "state_update",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "residual_pair_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "pair_state_enters_pair_transition",
        "from": "value_sites.pair_after_incoming",
        "to": "modules.pair_transition",
        "kind": "data_flow",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "pair_transition_mlp",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "pair_transition_produces_refined_pair_features",
        "from": "modules.pair_transition",
        "to": "value_sites.refined_pair_features",
        "kind": "state_update",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "residual_pair_transition",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_pair_transform_code",
              "role": "implementation_evidence",
              "locator": "PairTransformLayer.forward"
            }
          ]
        }
      },
      {
        "id": "single_features_enter_ipa",
        "from": "value_sites.single_features",
        "to": "modules.invariant_point_attention",
        "kind": "data_flow",
        "carries": [
          "representations.single_features"
        ],
        "operation": "attend_from_single_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "refined_pair_features_bias_ipa",
        "from": "value_sites.refined_pair_features",
        "to": "modules.invariant_point_attention",
        "kind": "conditioning",
        "carries": [
          "representations.pair_features"
        ],
        "operation": "pair_conditioned_attention",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "current_frames_condition_ipa",
        "from": "value_sites.current_frames",
        "to": "modules.invariant_point_attention",
        "kind": "conditioning",
        "carries": [
          "representations.residue_frames"
        ],
        "operation": "express_attention_points_in_frames",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "feature_bundle_masks_ipa",
        "from": "value_sites.feature_bundle",
        "to": "modules.invariant_point_attention",
        "kind": "conditioning",
        "carries": [
          "representations.feature_bundle"
        ],
        "operation": "mask_padded_residues",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "ipa_produces_updated_single_state",
        "from": "modules.invariant_point_attention",
        "to": "value_sites.single_after_ipa",
        "kind": "state_update",
        "carries": [
          "representations.single_features"
        ],
        "operation": "residual_attention_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "ipa_state_enters_structure_transition",
        "from": "value_sites.single_after_ipa",
        "to": "modules.structure_transition",
        "kind": "data_flow",
        "carries": [
          "representations.single_features"
        ],
        "operation": "transition_single_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "structure_transition_produces_single_state",
        "from": "modules.structure_transition",
        "to": "value_sites.single_after_transition",
        "kind": "state_update",
        "carries": [
          "representations.single_features"
        ],
        "operation": "feed_forward_update",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "single_state_enters_backbone_update",
        "from": "value_sites.single_after_transition",
        "to": "modules.backbone_update",
        "kind": "data_flow",
        "carries": [
          "representations.single_features"
        ],
        "operation": "regress_rigid_increment",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "current_frames_enter_backbone_update",
        "from": "value_sites.current_frames",
        "to": "modules.backbone_update",
        "kind": "state_update",
        "carries": [
          "representations.residue_frames"
        ],
        "operation": "compose_rigid_increment",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "backbone_update_produces_updated_frames",
        "from": "modules.backbone_update",
        "to": "value_sites.updated_frames",
        "kind": "state_update",
        "carries": [
          "representations.residue_frames"
        ],
        "operation": "compose_updated_frames",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_structure_code",
              "role": "implementation_evidence",
              "locator": "StructureLayer.forward"
            }
          ]
        }
      },
      {
        "id": "current_frames_enter_noise_readout",
        "from": "value_sites.current_frames",
        "to": "modules.noise_readout",
        "kind": "data_flow",
        "carries": [
          "representations.residue_frames"
        ],
        "operation": "retain_noisy_translations",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "updated_frames_enter_noise_readout",
        "from": "value_sites.updated_frames",
        "to": "modules.noise_readout",
        "kind": "data_flow",
        "carries": [
          "representations.residue_frames"
        ],
        "operation": "read_updated_translations",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "noise_readout_produces_predicted_noise",
        "from": "modules.noise_readout",
        "to": "value_sites.predicted_noise",
        "kind": "data_flow",
        "carries": [
          "representations.coordinate_noise"
        ],
        "operation": "subtract_updated_from_noisy_translation",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_model_code",
              "role": "implementation_evidence",
              "locator": "Denoiser.forward"
            }
          ]
        }
      },
      {
        "id": "current_coordinates_enter_reverse_update",
        "from": "value_sites.current_coordinates",
        "to": "modules.reverse_diffusion_update",
        "kind": "state_update",
        "carries": [
          "representations.ca_coordinates"
        ],
        "operation": "provide_current_coordinates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "predicted_noise_enters_reverse_update",
        "from": "value_sites.predicted_noise",
        "to": "modules.reverse_diffusion_update",
        "kind": "data_flow",
        "carries": [
          "representations.coordinate_noise"
        ],
        "operation": "parameterize_posterior_mean",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "timestep_enters_reverse_update",
        "from": "value_sites.timestep",
        "to": "modules.reverse_diffusion_update",
        "kind": "control",
        "carries": [
          "representations.timestep"
        ],
        "operation": "select_schedule_coefficients",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "step_noise_sampler_produces_fresh_noise",
        "from": "modules.step_noise_sampler",
        "to": "value_sites.fresh_step_noise",
        "kind": "data_flow",
        "carries": [
          "representations.coordinate_noise"
        ],
        "operation": "sample_gaussian_noise",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "fresh_noise_enters_reverse_update",
        "from": "value_sites.fresh_step_noise",
        "to": "modules.reverse_diffusion_update",
        "kind": "data_flow",
        "carries": [
          "representations.coordinate_noise"
        ],
        "operation": "add_scaled_step_noise",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "reverse_update_produces_next_coordinates",
        "from": "modules.reverse_diffusion_update",
        "to": "value_sites.next_coordinates",
        "kind": "state_update",
        "carries": [
          "representations.ca_coordinates"
        ],
        "operation": "sample_next_ca_coordinates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "next_coordinates_reenter_sampling_state",
        "from": "value_sites.next_coordinates",
        "to": "value_sites.current_coordinates",
        "kind": "state_update",
        "carries": [
          "representations.ca_coordinates"
        ],
        "operation": "continue_reverse_chain",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "terminal_coordinates_become_final_coordinates",
        "from": "value_sites.next_coordinates",
        "to": "value_sites.final_coordinates",
        "kind": "state_update",
        "carries": [
          "representations.ca_coordinates"
        ],
        "operation": "select_step_one_coordinates",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler._sample"
            }
          ]
        }
      },
      {
        "id": "final_coordinates_enter_pdb_exporter",
        "from": "value_sites.final_coordinates",
        "to": "modules.pdb_exporter",
        "kind": "data_flow",
        "carries": [
          "representations.ca_coordinates"
        ],
        "operation": "prepare_ca_records",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.on_sample_end"
            }
          ]
        }
      },
      {
        "id": "pdb_exporter_writes_backbone_pdb",
        "from": "modules.pdb_exporter",
        "to": "value_sites.generated_backbone_pdb",
        "kind": "data_flow",
        "carries": [
          "representations.backbone_pdb"
        ],
        "operation": "serialize_pdb",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_scaffold_sampler_code",
              "role": "implementation_evidence",
              "locator": "ScaffoldSampler.on_sample_end"
            }
          ]
        }
      }
    ],
    "claims": [
      {
        "id": "motif_geometry_is_intra_group",
        "statement": "For multi-motif inputs, fixed_structure_mask exposes distances within each motif group while leaving relative positions and orientations between groups unspecified.",
        "scope": {
          "module_ref": "modules.pair_feature_net"
        },
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "genie2_2024",
              "role": "supporting_evidence",
              "locator": "Sec. 2.2 and Fig. 1"
            }
          ]
        }
      },
      {
        "id": "model_is_sequence_agnostic",
        "statement": "Genie 2 generates C-alpha backbone geometry rather than a complete amino-acid sequence; motif identities may condition the model, while generated scaffold residues use alanine placeholders in exported PDB files.",
        "scope": {
          "module_ref": "modules.pdb_exporter"
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_sampler_code",
              "role": "implementation_evidence",
              "locator": "BaseSampler.on_sample_end documentation"
            }
          ]
        }
      },
      {
        "id": "base_model_omits_triangle_attention",
        "statement": "The implementation supports triangular attention, but the released base configuration disables it; the active pair-transform board therefore shows triangular multiplication and pair transition only.",
        "scope": {
          "module_ref": "modules.pair_transform_stack"
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "genie2_config_code",
              "role": "configuration_evidence",
              "locator": "Config._create_config"
            }
          ]
        }
      }
    ],
    "openQuestions": [
      {
        "id": "duplicated_fixed_sequence_mask_channel",
        "question": "Is concatenating fixed_sequence_mask twice in SingleFeatureNet.forward intentional, or is one channel a legacy placeholder for a removed feature?",
        "status": "unresolved",
        "affected_refs": [
          "modules.single_feature_net"
        ],
        "blocking": false,
        "resolution_criteria": "Confirm the intended 20 + 3 auxiliary-channel design with the authors or a later revision of the implementation.",
        "evidence": {
          "status": "open_question",
          "refs": [
            {
              "source_ref": "genie2_single_feature_code",
              "role": "question_source",
              "locator": "SingleFeatureNet.forward torch.cat",
              "note": "The concatenation includes fixed_sequence_mask twice followed by interface_mask."
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
    "genie2": {
      "sourceYaml": "../../pseudocode/genie2.yaml",
      "sources": [
        {
          "id": "sampler_code",
          "source_ref": "genie2_sampler_code"
        },
        {
          "id": "model_code",
          "source_ref": "genie2_model_code"
        },
        {
          "id": "single_code",
          "source_ref": "genie2_single_feature_code"
        },
        {
          "id": "pair_code",
          "source_ref": "genie2_pair_feature_code"
        },
        {
          "id": "pair_transform_code",
          "source_ref": "genie2_pair_transform_code"
        },
        {
          "id": "structure_code",
          "source_ref": "genie2_structure_code"
        }
      ],
      "symbols": [
        {
          "id": "feature_bundle",
          "name": "features",
          "architectureRef": "representations.feature_bundle"
        },
        {
          "id": "current_coordinates",
          "name": "x_t",
          "tex": "x_t",
          "architectureRef": "representations.ca_coordinates"
        },
        {
          "id": "current_frames",
          "name": "T_t",
          "tex": "T_t",
          "architectureRef": "representations.residue_frames"
        },
        {
          "id": "timestep",
          "name": "t",
          "architectureRef": "representations.timestep"
        },
        {
          "id": "single_features",
          "name": "s",
          "architectureRef": "representations.single_features"
        },
        {
          "id": "pair_features",
          "name": "p",
          "architectureRef": "representations.pair_features"
        },
        {
          "id": "updated_frames",
          "name": "T_hat",
          "tex": "\\hat{T}",
          "architectureRef": "representations.residue_frames"
        },
        {
          "id": "predicted_noise",
          "name": "z_theta",
          "tex": "z_\\theta",
          "architectureRef": "representations.coordinate_noise"
        },
        {
          "id": "step_noise",
          "name": "z",
          "architectureRef": "representations.coordinate_noise"
        },
        {
          "id": "next_coordinates",
          "name": "x_(t-1)",
          "tex": "x_{t-1}",
          "architectureRef": "representations.ca_coordinates"
        },
        {
          "id": "final_coordinates",
          "name": "x_0",
          "tex": "x_0",
          "architectureRef": "representations.ca_coordinates"
        }
      ],
      "lines": [
        {
          "id": "initialize_coordinates",
          "text": "x_t = randn_like(features.atom_positions)",
          "refs": "BaseSampler._sample",
          "architectureRefs": [
            "modules.coordinate_initializer"
          ]
        },
        {
          "id": "derive_current_frames",
          "text": "T_t = Frames(rotation=Frenet(x_t, chain_index, mask), translation=x_t)",
          "refs": "BaseSampler._sample",
          "architectureRefs": [
            "modules.frenet_frame_builder"
          ]
        },
        {
          "id": "encode_single_state",
          "text": "s = Linear(concat(residue_pos, chain_pos, time(t), masked_motif_aatype, masks))",
          "refs": "SingleFeatureNet.forward",
          "architectureRefs": [
            "modules.single_feature_net"
          ]
        },
        {
          "id": "encode_pair_state",
          "text": "p = OuterSum(s) + RelPos(features) + NoisyFrameTemplate(T_t) + MaskedMotifDistances(features)",
          "refs": "PairFeatureNet.forward",
          "architectureRefs": [
            "modules.pair_feature_net",
            "claims.motif_geometry_is_intra_group"
          ]
        },
        {
          "id": "refine_pair_state",
          "text": "repeat 5: p += TriMulOutgoing(p); p += TriMulIncoming(p); p += PairTransition(p)",
          "refs": "PairTransformLayer.forward",
          "architectureRefs": [
            "modules.pair_transform_stack",
            "claims.base_model_omits_triangle_attention"
          ]
        },
        {
          "id": "update_structure",
          "text": "repeat 8: s = Transition(LayerNorm(s + IPA(s, p, T_t))); T_t = T_t.compose(BackboneUpdate(s))",
          "refs": "StructureLayer.forward and StructureNet.forward",
          "architectureRefs": [
            "modules.equivariant_structure_decoder"
          ]
        },
        {
          "id": "read_noise",
          "text": "z_theta = input_frames.trans - updated_frames.trans",
          "refs": "Denoiser.forward",
          "architectureRefs": [
            "modules.noise_readout"
          ]
        },
        {
          "id": "reverse_step",
          "text": "mean = (x_t - ((1 - alpha_t) / sqrt(1 - alpha_bar_t)) * z_theta) / sqrt(alpha_t); x_(t-1) = mean if t == 1 else mean + scale * sqrt(beta_t) * z",
          "refs": "BaseSampler._sample",
          "architectureRefs": [
            "modules.step_noise_sampler",
            "modules.reverse_diffusion_update"
          ]
        },
        {
          "id": "emit_backbone",
          "text": "final_coordinates = x_(t-1)  # at t = 1; serialized as C-alpha PDB records",
          "refs": "BaseSampler._sample",
          "architectureRefs": [
            "modules.pdb_exporter",
            "claims.model_is_sequence_agnostic"
          ]
        }
      ],
      "claims": [
        {
          "id": "denoiser_and_sampler_are_separate",
          "statement": "The learned denoiser predicts coordinate noise; the posterior mean, stochastic noise term, and frame reconstruction are fixed sampler operations outside the model.",
          "line_refs": [
            "derive_current_frames",
            "read_noise",
            "reverse_step"
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie2_model_code",
                "role": "implementation_evidence",
                "locator": "Denoiser.forward"
              },
              {
                "source_ref": "genie2_sampler_code",
                "role": "implementation_evidence",
                "locator": "BaseSampler._sample"
              }
            ]
          }
        }
      ]
    }
  },
  "boards": {
    "schemaVersion": "visualization-v0.4",
    "sourceYaml": "../../views/genie2-semantic-zoom.view.yaml",
    "rootBoard": "generation_overview",
    "items": [
      {
        "id": "generation_overview",
        "title": "Genie 2 Backbone Generation",
        "summary": "A target length or motif specification becomes a reusable conditioning bundle; Genie 2 denoises random C-alpha coordinates, then exports the sequence-agnostic backbone as PDB records.",
        "subject_ref": "architecture",
        "expansion_depth": 1,
        "grid": {
          "columns": 7,
          "rows": 4,
          "column_sizing": "content",
          "col_gap": 46
        },
        "nodes": [
          {
            "id": "generation_request",
            "ref": "value_sites.generation_request",
            "label": "generation request",
            "notation": "length / motif PDB",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "glyph": "vector",
            "col": 1,
            "row": 2
          },
          {
            "id": "feature_builder",
            "ref": "modules.feature_builder",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 2
          },
          {
            "id": "feature_bundle",
            "ref": "value_sites.feature_bundle",
            "label": "residue + motif features",
            "notation": "F",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 3,
            "row": 2
          },
          {
            "id": "reverse_diffusion_sampler",
            "ref": "modules.reverse_diffusion_sampler",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 2,
            "board_ref": "sampling_loop"
          },
          {
            "id": "final_coordinates",
            "ref": "value_sites.final_coordinates",
            "label": "generated C-alpha coordinates",
            "notation": "x_0",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 2
          },
          {
            "id": "pdb_exporter",
            "ref": "modules.pdb_exporter",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 2
          },
          {
            "id": "generated_backbone_pdb",
            "ref": "value_sites.generated_backbone_pdb",
            "label": "backbone PDB",
            "notation": ".pdb",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "matrix",
            "col": 7,
            "row": 2
          }
        ],
        "exclude": [
          {
            "ref": "modules.single_feature_net",
            "reason": "The task overview carries the feature bundle into the sampler once; its sequence-conditioning use is expanded on the denoiser and invariant-encoder boards."
          },
          {
            "ref": "modules.pair_feature_net",
            "reason": "The task overview suppresses the separate internal pair-geometry use so it does not become a duplicate feature-to-sampler wire."
          },
          {
            "ref": "modules.invariant_point_attention",
            "reason": "Residue-mask use inside IPA belongs to the structure-decoder detail rather than the task overview."
          },
          {
            "ref": "modules.frenet_frame_builder",
            "reason": "Frenet construction is expanded inside the sampling loop; the task overview keeps one feature-to-sampler connection."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.generation_request_enters_feature_builder"
            },
            "label": "mode + size",
            "connection": {
              "title": "Generation request",
              "role": "task boundary input",
              "inside": "Unconditional generation supplies a target length; scaffolding supplies a motif PDB specification that also determines scaffold placement ranges."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_builder_produces_feature_bundle"
            },
            "label": "masks + constraints",
            "tone": "conditioning",
            "connection": {
              "title": "Prepared sampling features",
              "role": "cached conditioning",
              "inside": "The builder prepares residue and chain indices, masks, and optional motif sequence and intra-motif geometry constraints once for the full reverse chain."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_bundle_sets_initial_coordinate_shape"
            },
            "label": "1000 reverse steps",
            "connection": {
              "title": "Features enter reverse diffusion",
              "role": "sampling context",
              "inside": "The feature bundle fixes the number of residues and remains read-only while the sampler repeatedly updates C-alpha coordinates."
            }
          },
          {
            "match": {
              "relation_ref": "relations.terminal_coordinates_become_final_coordinates"
            },
            "label": "x_0",
            "connection": {
              "title": "Terminal coordinates",
              "role": "sampler output",
              "inside": "After the step-one posterior mean, the terminal C-alpha coordinate trace becomes the generated backbone."
            }
          },
          {
            "match": {
              "relation_ref": "relations.final_coordinates_enter_pdb_exporter"
            },
            "label": "C-alpha trace",
            "connection": {
              "title": "Coordinates to exporter",
              "role": "output serialization",
              "inside": "The exporter receives geometry, not a newly designed amino-acid sequence."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pdb_exporter_writes_backbone_pdb"
            },
            "label": "PDB records",
            "connection": {
              "title": "Generated backbone PDB",
              "role": "task boundary output",
              "inside": "Scaffold residues use alanine placeholders; fixed motif identities can be retained from the conditioning input."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_e8504796740e",
            "from": "feature_builder",
            "to": "feature_bundle",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.feature_builder_produces_feature_bundle"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_builder_produces_feature_bundle"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "masks + constraints",
              "tone": "conditioning",
              "connection": {
                "title": "Prepared sampling features",
                "role": "cached conditioning",
                "inside": "The builder prepares residue and chain indices, masks, and optional motif sequence and intra-motif geometry constraints once for the full reverse chain."
              }
            }
          },
          {
            "id": "projection_c7665c3a6e7e",
            "from": "feature_bundle",
            "to": "reverse_diffusion_sampler",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_sets_initial_coordinate_shape"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_sets_initial_coordinate_shape"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "1000 reverse steps",
              "connection": {
                "title": "Features enter reverse diffusion",
                "role": "sampling context",
                "inside": "The feature bundle fixes the number of residues and remains read-only while the sampler repeatedly updates C-alpha coordinates."
              }
            }
          },
          {
            "id": "projection_a3ff675098b6",
            "from": "final_coordinates",
            "to": "pdb_exporter",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.final_coordinates_enter_pdb_exporter"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.final_coordinates_enter_pdb_exporter"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.ca_coordinates"
            ],
            "presentation": {
              "label": "C-alpha trace",
              "connection": {
                "title": "Coordinates to exporter",
                "role": "output serialization",
                "inside": "The exporter receives geometry, not a newly designed amino-acid sequence."
              }
            }
          },
          {
            "id": "projection_7abfccb36c40",
            "from": "generation_request",
            "to": "feature_builder",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.generation_request_enters_feature_builder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.generation_request_enters_feature_builder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.generation_request"
            ],
            "presentation": {
              "label": "mode + size",
              "connection": {
                "title": "Generation request",
                "role": "task boundary input",
                "inside": "Unconditional generation supplies a target length; scaffolding supplies a motif PDB specification that also determines scaffold placement ranges."
              }
            }
          },
          {
            "id": "projection_f3e38678d163",
            "from": "pdb_exporter",
            "to": "generated_backbone_pdb",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.pdb_exporter_writes_backbone_pdb"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pdb_exporter_writes_backbone_pdb"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.backbone_pdb"
            ],
            "presentation": {
              "label": "PDB records",
              "connection": {
                "title": "Generated backbone PDB",
                "role": "task boundary output",
                "inside": "Scaffold residues use alanine placeholders; fixed motif identities can be retained from the conditioning input."
              }
            }
          },
          {
            "id": "projection_d6733af11b05",
            "from": "reverse_diffusion_sampler",
            "to": "final_coordinates",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.terminal_coordinates_become_final_coordinates"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.terminal_coordinates_become_final_coordinates"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.ca_coordinates"
            ],
            "presentation": {
              "label": "x_0",
              "connection": {
                "title": "Terminal coordinates",
                "role": "sampler output",
                "inside": "After the step-one posterior mean, the terminal C-alpha coordinate trace becomes the generated backbone."
              }
            }
          }
        ],
        "classifications": {
          "modules.backbone_update": "collapsed:modules.reverse_diffusion_sampler",
          "modules.coordinate_initializer": "collapsed:modules.reverse_diffusion_sampler",
          "modules.feature_builder": "visible",
          "modules.frenet_frame_builder": "excluded",
          "modules.invariant_point_attention": "excluded",
          "modules.noise_readout": "collapsed:modules.reverse_diffusion_sampler",
          "modules.pair_feature_net": "excluded",
          "modules.pair_transition": "collapsed:modules.reverse_diffusion_sampler",
          "modules.pdb_exporter": "visible",
          "modules.reverse_diffusion_sampler": "visible",
          "modules.reverse_diffusion_update": "collapsed:modules.reverse_diffusion_sampler",
          "modules.single_feature_net": "excluded",
          "modules.step_noise_sampler": "collapsed:modules.reverse_diffusion_sampler",
          "modules.structure_transition": "collapsed:modules.reverse_diffusion_sampler",
          "modules.timestep_controller": "collapsed:modules.reverse_diffusion_sampler",
          "modules.triangle_multiplication_incoming": "collapsed:modules.reverse_diffusion_sampler",
          "modules.triangle_multiplication_outgoing": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.current_coordinates": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.current_frames": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.feature_bundle": "visible",
          "value_sites.final_coordinates": "visible",
          "value_sites.fresh_step_noise": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.generated_backbone_pdb": "visible",
          "value_sites.generation_request": "visible",
          "value_sites.initial_coordinates": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.initial_pair_features": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.next_coordinates": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.pair_after_incoming": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.pair_after_outgoing": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.predicted_noise": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.refined_pair_features": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.single_after_ipa": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.single_after_transition": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.timestep": "collapsed:modules.reverse_diffusion_sampler",
          "value_sites.updated_frames": "collapsed:modules.reverse_diffusion_sampler"
        },
        "projectionMode": "derived"
      },
      {
        "id": "sampling_loop",
        "title": "1000-Step Reverse Diffusion",
        "summary": "Random C-alpha coordinates initialize x_T. Each step derives Frenet frames from x_t for the denoiser, then fixed DDPM math updates only the coordinates to x_(t-1).",
        "parent": "generation_overview",
        "subject_ref": "modules.reverse_diffusion_sampler",
        "expansion_depth": 1,
        "grid": {
          "columns": 8,
          "rows": 6,
          "column_sizing": "content",
          "col_gap": 42
        },
        "nodes": [
          {
            "id": "feature_bundle",
            "ref": "value_sites.feature_bundle",
            "label": "cached features",
            "notation": "F",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 1,
            "row": 1
          },
          {
            "id": "coordinate_initializer",
            "ref": "modules.coordinate_initializer",
            "label": "Gaussian coordinate initializer",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 3
          },
          {
            "id": "current_coordinates",
            "ref": "value_sites.current_coordinates",
            "label": "current noisy C-alpha coordinates",
            "notation": "x_t",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 3
          },
          {
            "id": "timestep_controller",
            "ref": "modules.timestep_controller",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 1
          },
          {
            "id": "timestep",
            "ref": "value_sites.timestep",
            "label": "timestep",
            "notation": "t",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "scalar",
            "col": 3,
            "row": 1
          },
          {
            "id": "frenet_frame_builder",
            "ref": "modules.frenet_frame_builder",
            "label": "derive Frenet frames",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 3
          },
          {
            "id": "denoiser",
            "ref": "modules.denoiser",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 3,
            "board_ref": "denoiser_forward"
          },
          {
            "id": "predicted_noise",
            "ref": "value_sites.predicted_noise",
            "label": "predicted coordinate noise",
            "notation": "z_theta",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "matrix",
            "col": 5,
            "row": 3
          },
          {
            "id": "step_noise_sampler",
            "ref": "modules.step_noise_sampler",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 1
          },
          {
            "id": "fresh_step_noise",
            "ref": "value_sites.fresh_step_noise",
            "label": "fresh step noise",
            "notation": "z",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "matrix",
            "col": 6,
            "row": 1
          },
          {
            "id": "reverse_diffusion_update",
            "ref": "modules.reverse_diffusion_update",
            "prominence": "primary",
            "treatment": "block",
            "col": 6,
            "row": 3
          },
          {
            "id": "next_coordinates",
            "ref": "value_sites.next_coordinates",
            "label": "next C-alpha coordinates",
            "notation": "x_(t-1)",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 3
          },
          {
            "id": "final_coordinates",
            "ref": "value_sites.final_coordinates",
            "label": "final C-alpha coordinates",
            "notation": "x_0",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 8,
            "row": 3
          }
        ],
        "elide": [
          {
            "ref": "value_sites.initial_coordinates"
          },
          {
            "ref": "value_sites.current_frames"
          }
        ],
        "exclude": [
          {
            "ref": "modules.pair_feature_net",
            "reason": "The sampling-loop board represents all learned uses of x_t through one denoiser wire; noisy pair geometry is expanded on the invariant-encoder board."
          },
          {
            "ref": "modules.invariant_point_attention",
            "reason": "Frame-point conditioning and residue masking are internal to the structure decoder and are expanded on its child board."
          },
          {
            "ref": "modules.backbone_update",
            "reason": "Frame composition is internal to the structure decoder; suppressing it here keeps one derived-frames-to-denoiser wire."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.feature_bundle_sets_initial_coordinate_shape"
            },
            "label": "N residues",
            "tone": "conditioning",
            "connection": {
              "title": "Requested shape",
              "role": "initialization context",
              "inside": "The residue mask fixes the coordinate tensor shape before standard-normal translations are sampled."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.coordinate_initializer_produces_initial_coordinates",
                "relations.initial_coordinates_begin_sampling_state"
              ]
            },
            "label": "Gaussian x_T",
            "connection": {
              "title": "Initial random trace",
              "role": "reverse-chain initialization",
              "inside": "The sampler draws one standard-normal C-alpha coordinate for every residue; these coordinates are the initial diffusion state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_coordinates_enter_frenet_frame_builder"
            },
            "label": "x_t",
            "connection": {
              "title": "Current coordinate trace",
              "role": "derived-geometry input",
              "inside": "The current stochastic state is the B by N by 3 C-alpha trace, not a separately sampled set of rotations."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_bundle_conditions_frenet_frame_builder"
            },
            "label": "chain + mask",
            "tone": "conditioning",
            "connection": {
              "title": "Frame-construction context",
              "role": "chain-aware geometric derivation",
              "inside": "Chain indices and the residue mask determine which neighboring coordinates define each Frenet rotation."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.frenet_frame_builder_produces_current_frames",
                "relations.current_frames_enter_noise_readout"
              ]
            },
            "label": "derived T(x_t)",
            "connection": {
              "title": "Derived frames to denoiser",
              "role": "geometric model input",
              "inside": "The denoiser receives x_t packaged with Frenet rotations computed deterministically from that same coordinate trace."
            }
          },
          {
            "match": {
              "relation_ref": "relations.timestep_controller_produces_timestep"
            },
            "label": "1000 → 1",
            "tone": "conditioning",
            "connection": {
              "title": "Reverse timestep",
              "role": "loop control",
              "inside": "The controller selects one schedule index for both the denoiser and posterior update."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_bundle_conditions_single_feature_net"
            },
            "label": "cached features",
            "tone": "conditioning",
            "connection": {
              "title": "Cached features to denoiser",
              "role": "read-only model context",
              "inside": "The denoiser receives the prepared residue layout and optional motif constraints at every reverse step."
            }
          },
          {
            "match": {
              "relation_ref": "relations.timestep_conditions_single_feature_net"
            },
            "label": "t",
            "tone": "conditioning",
            "connection": {
              "title": "Timestep to denoiser",
              "role": "noise-level conditioning",
              "inside": "The denoiser embeds the current reverse index into its per-residue single state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_coordinates_enter_reverse_update"
            },
            "label": "x_t",
            "connection": {
              "title": "Current coordinates to DDPM update",
              "role": "reverse-process state",
              "inside": "The fixed posterior equation combines the current C-alpha coordinates with the denoiser prediction and schedule coefficients."
            }
          },
          {
            "match": {
              "relation_ref": "relations.noise_readout_produces_predicted_noise"
            },
            "label": "z_theta",
            "connection": {
              "title": "Predicted coordinate noise",
              "role": "learned reverse-process parameter",
              "inside": "The model outputs one three-vector per residue; it does not directly perform the DDPM posterior update."
            }
          },
          {
            "match": {
              "relation_ref": "relations.fresh_noise_enters_reverse_update"
            },
            "label": "scale · sigma_t · z",
            "connection": {
              "title": "Stochastic step term",
              "role": "reverse-step randomness",
              "inside": "Fresh Gaussian noise is added on steps above one; the last update uses only the posterior mean."
            }
          },
          {
            "match": {
              "relation_ref": "relations.reverse_update_produces_next_coordinates"
            },
            "label": "posterior update",
            "connection": {
              "title": "Next reverse state",
              "role": "fixed sampler math",
              "inside": "Schedule coefficients and, above step one, fresh Gaussian noise produce the next C-alpha coordinate trace."
            }
          },
          {
            "match": {
              "relation_ref": "relations.next_coordinates_reenter_sampling_state"
            },
            "label": "next iteration",
            "tone": "skip",
            "route_side": "bottom",
            "route_clearance": 52,
            "connection": {
              "title": "Reverse-chain recurrence",
              "role": "loop state update",
              "inside": "The newly sampled C-alpha coordinates become x_t for the following, lower timestep; Frenet frames are then derived again."
            }
          },
          {
            "match": {
              "relation_ref": "relations.terminal_coordinates_become_final_coordinates"
            },
            "label": "when t = 1",
            "connection": {
              "title": "Sampling termination",
              "role": "final state selection",
              "inside": "The step-one mean is exposed as the generated backbone coordinate trace."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_588713236286",
            "from": "coordinate_initializer",
            "to": "current_coordinates",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.coordinate_initializer_produces_initial_coordinates",
              "relations.initial_coordinates_begin_sampling_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.coordinate_initializer_produces_initial_coordinates"
              },
              {
                "relation_ref": "relations.initial_coordinates_begin_sampling_state"
              }
            ],
            "hidden_refs": [
              "value_sites.initial_coordinates"
            ],
            "carries": [
              "representations.ca_coordinates"
            ],
            "presentation": {
              "label": "Gaussian x_T",
              "connection": {
                "title": "Initial random trace",
                "role": "reverse-chain initialization",
                "inside": "The sampler draws one standard-normal C-alpha coordinate for every residue; these coordinates are the initial diffusion state."
              }
            }
          },
          {
            "id": "projection_4c0f3c51159c",
            "from": "current_coordinates",
            "to": "frenet_frame_builder",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.current_coordinates_enter_frenet_frame_builder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_coordinates_enter_frenet_frame_builder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.ca_coordinates"
            ],
            "presentation": {
              "label": "x_t",
              "connection": {
                "title": "Current coordinate trace",
                "role": "derived-geometry input",
                "inside": "The current stochastic state is the B by N by 3 C-alpha trace, not a separately sampled set of rotations."
              }
            }
          },
          {
            "id": "projection_0683257732ca",
            "from": "current_coordinates",
            "to": "reverse_diffusion_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.current_coordinates_enter_reverse_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_coordinates_enter_reverse_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.ca_coordinates"
            ],
            "presentation": {
              "label": "x_t",
              "connection": {
                "title": "Current coordinates to DDPM update",
                "role": "reverse-process state",
                "inside": "The fixed posterior equation combines the current C-alpha coordinates with the denoiser prediction and schedule coefficients."
              }
            }
          },
          {
            "id": "projection_2d5bc6d7ef90",
            "from": "denoiser",
            "to": "predicted_noise",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.noise_readout_produces_predicted_noise"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.noise_readout_produces_predicted_noise"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.coordinate_noise"
            ],
            "presentation": {
              "label": "z_theta",
              "connection": {
                "title": "Predicted coordinate noise",
                "role": "learned reverse-process parameter",
                "inside": "The model outputs one three-vector per residue; it does not directly perform the DDPM posterior update."
              }
            }
          },
          {
            "id": "projection_30a8d9196e4f",
            "from": "feature_bundle",
            "to": "coordinate_initializer",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_sets_initial_coordinate_shape"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_sets_initial_coordinate_shape"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "N residues",
              "tone": "conditioning",
              "connection": {
                "title": "Requested shape",
                "role": "initialization context",
                "inside": "The residue mask fixes the coordinate tensor shape before standard-normal translations are sampled."
              }
            }
          },
          {
            "id": "projection_6596a37b56d8",
            "from": "feature_bundle",
            "to": "denoiser",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_conditions_single_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_conditions_single_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "cached features",
              "tone": "conditioning",
              "connection": {
                "title": "Cached features to denoiser",
                "role": "read-only model context",
                "inside": "The denoiser receives the prepared residue layout and optional motif constraints at every reverse step."
              }
            }
          },
          {
            "id": "projection_826c1250fe7b",
            "from": "feature_bundle",
            "to": "frenet_frame_builder",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_conditions_frenet_frame_builder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_conditions_frenet_frame_builder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "chain + mask",
              "tone": "conditioning",
              "connection": {
                "title": "Frame-construction context",
                "role": "chain-aware geometric derivation",
                "inside": "Chain indices and the residue mask determine which neighboring coordinates define each Frenet rotation."
              }
            }
          },
          {
            "id": "projection_a1e5fc30349b",
            "from": "frenet_frame_builder",
            "to": "denoiser",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.frenet_frame_builder_produces_current_frames",
              "relations.current_frames_enter_noise_readout"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.frenet_frame_builder_produces_current_frames"
              },
              {
                "relation_ref": "relations.current_frames_enter_noise_readout"
              }
            ],
            "hidden_refs": [
              "value_sites.current_frames"
            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
              "label": "derived T(x_t)",
              "connection": {
                "title": "Derived frames to denoiser",
                "role": "geometric model input",
                "inside": "The denoiser receives x_t packaged with Frenet rotations computed deterministically from that same coordinate trace."
              }
            }
          },
          {
            "id": "projection_e9de4dbb5f4f",
            "from": "fresh_step_noise",
            "to": "reverse_diffusion_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.fresh_noise_enters_reverse_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.fresh_noise_enters_reverse_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.coordinate_noise"
            ],
            "presentation": {
              "label": "scale · sigma_t · z",
              "connection": {
                "title": "Stochastic step term",
                "role": "reverse-step randomness",
                "inside": "Fresh Gaussian noise is added on steps above one; the last update uses only the posterior mean."
              }
            }
          },
          {
            "id": "projection_78bbb80c24c9",
            "from": "next_coordinates",
            "to": "current_coordinates",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.next_coordinates_reenter_sampling_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.next_coordinates_reenter_sampling_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.ca_coordinates"
            ],
            "presentation": {
              "label": "next iteration",
              "tone": "skip",
              "route_side": "bottom",
              "route_clearance": 52,
              "connection": {
                "title": "Reverse-chain recurrence",
                "role": "loop state update",
                "inside": "The newly sampled C-alpha coordinates become x_t for the following, lower timestep; Frenet frames are then derived again."
              }
            }
          },
          {
            "id": "projection_bc3b2cb9c02f",
            "from": "next_coordinates",
            "to": "final_coordinates",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.terminal_coordinates_become_final_coordinates"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.terminal_coordinates_become_final_coordinates"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.ca_coordinates"
            ],
            "presentation": {
              "label": "when t = 1",
              "connection": {
                "title": "Sampling termination",
                "role": "final state selection",
                "inside": "The step-one mean is exposed as the generated backbone coordinate trace."
              }
            }
          },
          {
            "id": "projection_a3be2644eb0b",
            "from": "predicted_noise",
            "to": "reverse_diffusion_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.predicted_noise_enters_reverse_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.predicted_noise_enters_reverse_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.coordinate_noise"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_e5b20f614e21",
            "from": "reverse_diffusion_update",
            "to": "next_coordinates",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.reverse_update_produces_next_coordinates"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.reverse_update_produces_next_coordinates"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.ca_coordinates"
            ],
            "presentation": {
              "label": "posterior update",
              "connection": {
                "title": "Next reverse state",
                "role": "fixed sampler math",
                "inside": "Schedule coefficients and, above step one, fresh Gaussian noise produce the next C-alpha coordinate trace."
              }
            }
          },
          {
            "id": "projection_85240a6d0eca",
            "from": "step_noise_sampler",
            "to": "fresh_step_noise",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.step_noise_sampler_produces_fresh_noise"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.step_noise_sampler_produces_fresh_noise"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.coordinate_noise"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_0b977f8cbc32",
            "from": "timestep",
            "to": "denoiser",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.timestep_conditions_single_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.timestep_conditions_single_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.timestep"
            ],
            "presentation": {
              "label": "t",
              "tone": "conditioning",
              "connection": {
                "title": "Timestep to denoiser",
                "role": "noise-level conditioning",
                "inside": "The denoiser embeds the current reverse index into its per-residue single state."
              }
            }
          },
          {
            "id": "projection_3d074870d011",
            "from": "timestep",
            "to": "reverse_diffusion_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "control",
            "relation_path": [
              "relations.timestep_enters_reverse_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.timestep_enters_reverse_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.timestep"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_f8f49300f3a2",
            "from": "timestep_controller",
            "to": "timestep",
            "projection": "direct",
            "origin": "canonical",
            "kind": "control",
            "relation_path": [
              "relations.timestep_controller_produces_timestep"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.timestep_controller_produces_timestep"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.timestep"
            ],
            "presentation": {
              "label": "1000 → 1",
              "tone": "conditioning",
              "connection": {
                "title": "Reverse timestep",
                "role": "loop control",
                "inside": "The controller selects one schedule index for both the denoiser and posterior update."
              }
            }
          }
        ],
        "classifications": {
          "modules.backbone_update": "excluded",
          "modules.coordinate_initializer": "visible",
          "modules.denoiser": "visible",
          "modules.frenet_frame_builder": "visible",
          "modules.invariant_point_attention": "excluded",
          "modules.noise_readout": "collapsed:modules.denoiser",
          "modules.pair_feature_net": "excluded",
          "modules.pair_transition": "collapsed:modules.denoiser",
          "modules.reverse_diffusion_update": "visible",
          "modules.single_feature_net": "collapsed:modules.denoiser",
          "modules.step_noise_sampler": "visible",
          "modules.structure_transition": "collapsed:modules.denoiser",
          "modules.timestep_controller": "visible",
          "modules.triangle_multiplication_incoming": "collapsed:modules.denoiser",
          "modules.triangle_multiplication_outgoing": "collapsed:modules.denoiser",
          "value_sites.current_coordinates": "visible",
          "value_sites.current_frames": "elided",
          "value_sites.feature_bundle": "visible",
          "value_sites.final_coordinates": "visible",
          "value_sites.fresh_step_noise": "visible",
          "value_sites.initial_coordinates": "elided",
          "value_sites.initial_pair_features": "collapsed:modules.denoiser",
          "value_sites.next_coordinates": "visible",
          "value_sites.pair_after_incoming": "collapsed:modules.denoiser",
          "value_sites.pair_after_outgoing": "collapsed:modules.denoiser",
          "value_sites.predicted_noise": "visible",
          "value_sites.refined_pair_features": "collapsed:modules.denoiser",
          "value_sites.single_after_ipa": "collapsed:modules.denoiser",
          "value_sites.single_after_transition": "collapsed:modules.denoiser",
          "value_sites.single_features": "collapsed:modules.denoiser",
          "value_sites.timestep": "visible",
          "value_sites.updated_frames": "collapsed:modules.denoiser"
        },
        "projectionMode": "derived"
      },
      {
        "id": "denoiser_forward",
        "title": "Genie 2 Denoiser Forward Pass",
        "summary": "The denoiser receives T(x_t), which packages noisy C-alpha translations with Frenet rotations derived from x_t. It encodes invariant geometry, updates frames equivariantly, and reads their translation displacement as predicted noise.",
        "parent": "sampling_loop",
        "subject_ref": "modules.denoiser",
        "expansion_depth": 1,
        "grid": {
          "columns": 7,
          "rows": 6,
          "column_sizing": "content",
          "col_gap": 48
        },
        "nodes": [
          {
            "id": "feature_bundle",
            "ref": "value_sites.feature_bundle",
            "label": "residue + motif features",
            "notation": "F",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 1,
            "row": 1
          },
          {
            "id": "timestep",
            "ref": "value_sites.timestep",
            "label": "timestep",
            "notation": "t",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "scalar",
            "col": 1,
            "row": 2
          },
          {
            "id": "current_frames",
            "ref": "value_sites.current_frames",
            "label": "derived frames from x_t",
            "notation": "T_t",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 4
          },
          {
            "id": "invariant_feature_encoder",
            "ref": "modules.invariant_feature_encoder",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 2,
            "board_ref": "invariant_feature_encoder"
          },
          {
            "id": "equivariant_structure_decoder",
            "ref": "modules.equivariant_structure_decoder",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 4,
            "board_ref": "structure_decoder"
          },
          {
            "id": "updated_frames",
            "ref": "value_sites.updated_frames",
            "label": "updated frame estimate",
            "notation": "T_hat",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 4
          },
          {
            "id": "noise_readout",
            "ref": "modules.noise_readout",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 4
          },
          {
            "id": "predicted_noise",
            "ref": "value_sites.predicted_noise",
            "label": "predicted coordinate noise",
            "notation": "z_theta = trans(T_t) - trans(T_hat)",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "glyph": "matrix",
            "col": 7,
            "row": 4
          }
        ],
        "exclude": [
          {
            "ref": "modules.frenet_frame_builder",
            "reason": "The parent sampling board owns the deterministic construction of the denoiser's T(x_t) input."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.feature_bundle_conditions_single_feature_net"
            },
            "label": "layout + motif sequence",
            "tone": "conditioning",
            "connection": {
              "title": "Feature bundle to invariant encoder",
              "role": "sequence-side conditioning",
              "inside": "Residue and chain indices, timestep-independent masks, and fixed motif identities are projected into the per-residue state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_bundle_conditions_pair_feature_net"
            },
            "label": "motif geometry",
            "tone": "conditioning",
            "route_side": "top",
            "route_clearance": 28,
            "connection": {
              "title": "Motif geometry to pair encoder",
              "role": "pair-side conditioning",
              "inside": "Fixed intra-motif C-alpha distances are injected into pair features while unspecified scaffold and inter-motif geometry remains free."
            }
          },
          {
            "match": {
              "relation_ref": "relations.timestep_conditions_single_feature_net"
            },
            "label": "time encoding",
            "tone": "conditioning",
            "connection": {
              "title": "Diffusion time",
              "role": "noise-level conditioning",
              "inside": "A sinusoidal timestep code is repeated over residues and concatenated into the single-feature input."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_frames_enter_pair_feature_net"
            },
            "label": "distances + orientations",
            "connection": {
              "title": "Noisy geometry into invariant encoding",
              "role": "current-structure observation",
              "inside": "Pairwise distances and relative frame orientations describe x_t without fixing a global pose."
            }
          },
          {
            "match": {
              "relation_ref": "relations.single_features_enter_ipa"
            },
            "label": "single state",
            "connection": {
              "title": "Single state to structure decoder",
              "role": "mutable residue state",
              "inside": "The invariant per-residue state supplies IPA queries and the features used to regress each rigid update."
            }
          },
          {
            "match": {
              "relation_ref": "relations.refined_pair_features_bias_ipa"
            },
            "label": "refined pair state",
            "tone": "conditioning",
            "route_side": "top",
            "route_clearance": 42,
            "connection": {
              "title": "Pair state to structure decoder",
              "role": "attention context",
              "inside": "Refined residue-pair features condition IPA while remaining fixed across the eight structure layers."
            }
          },
          {
            "match": {
              "relation_ref": "relations.backbone_update_produces_updated_frames"
            },
            "label": "8 equivariant updates",
            "connection": {
              "title": "Updated residue frames",
              "role": "decoder estimate",
              "inside": "Each structure layer composes a learned rigid increment; the eighth layer returns the final frame estimate for this denoiser call."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_frames_enter_noise_readout"
            },
            "label": "noisy translations",
            "route_side": "bottom",
            "route_clearance": 34,
            "connection": {
              "title": "Input side of displacement",
              "role": "noise readout minuend",
              "inside": "The original x_t translations are retained so the decoder displacement can be converted to the noise convention used by the DDPM loss."
            }
          },
          {
            "match": {
              "relation_ref": "relations.updated_frames_enter_noise_readout"
            },
            "label": "estimated clean direction",
            "connection": {
              "title": "Updated side of displacement",
              "role": "noise readout subtrahend",
              "inside": "Updated frame translations are subtracted from the original noisy translations."
            }
          },
          {
            "match": {
              "relation_ref": "relations.noise_readout_produces_predicted_noise"
            },
            "label": "coordinate difference",
            "connection": {
              "title": "Denoiser output",
              "role": "predicted diffusion noise",
              "inside": "The resulting B by N by 3 field is consumed by the fixed reverse-diffusion equation on the parent board."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_c406a0443cee",
            "from": "current_frames",
            "to": "equivariant_structure_decoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.current_frames_condition_ipa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_frames_condition_ipa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_a0f4e2ef4a06",
            "from": "current_frames",
            "to": "equivariant_structure_decoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.current_frames_enter_backbone_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_frames_enter_backbone_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_7699306d8e75",
            "from": "current_frames",
            "to": "invariant_feature_encoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.current_frames_enter_pair_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_frames_enter_pair_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
              "label": "distances + orientations",
              "connection": {
                "title": "Noisy geometry into invariant encoding",
                "role": "current-structure observation",
                "inside": "Pairwise distances and relative frame orientations describe x_t without fixing a global pose."
              }
            }
          },
          {
            "id": "projection_c542927b6731",
            "from": "current_frames",
            "to": "noise_readout",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.current_frames_enter_noise_readout"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_frames_enter_noise_readout"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
              "label": "noisy translations",
              "route_side": "bottom",
              "route_clearance": 34,
              "connection": {
                "title": "Input side of displacement",
                "role": "noise readout minuend",
                "inside": "The original x_t translations are retained so the decoder displacement can be converted to the noise convention used by the DDPM loss."
              }
            }
          },
          {
            "id": "projection_172961c8e836",
            "from": "equivariant_structure_decoder",
            "to": "updated_frames",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.backbone_update_produces_updated_frames"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.backbone_update_produces_updated_frames"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
              "label": "8 equivariant updates",
              "connection": {
                "title": "Updated residue frames",
                "role": "decoder estimate",
                "inside": "Each structure layer composes a learned rigid increment; the eighth layer returns the final frame estimate for this denoiser call."
              }
            }
          },
          {
            "id": "projection_615ffdd84e91",
            "from": "feature_bundle",
            "to": "equivariant_structure_decoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_masks_ipa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_masks_ipa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_4dc559d7f039",
            "from": "feature_bundle",
            "to": "invariant_feature_encoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_conditions_pair_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_conditions_pair_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "motif geometry",
              "tone": "conditioning",
              "route_side": "top",
              "route_clearance": 28,
              "connection": {
                "title": "Motif geometry to pair encoder",
                "role": "pair-side conditioning",
                "inside": "Fixed intra-motif C-alpha distances are injected into pair features while unspecified scaffold and inter-motif geometry remains free."
              }
            }
          },
          {
            "id": "projection_450cc34c1675",
            "from": "feature_bundle",
            "to": "invariant_feature_encoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_conditions_single_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_conditions_single_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "layout + motif sequence",
              "tone": "conditioning",
              "connection": {
                "title": "Feature bundle to invariant encoder",
                "role": "sequence-side conditioning",
                "inside": "Residue and chain indices, timestep-independent masks, and fixed motif identities are projected into the per-residue state."
              }
            }
          },
          {
            "id": "projection_b8233429d366",
            "from": "invariant_feature_encoder",
            "to": "equivariant_structure_decoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.refined_pair_features_bias_ipa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.refined_pair_features_bias_ipa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "refined pair state",
              "tone": "conditioning",
              "route_side": "top",
              "route_clearance": 42,
              "connection": {
                "title": "Pair state to structure decoder",
                "role": "attention context",
                "inside": "Refined residue-pair features condition IPA while remaining fixed across the eight structure layers."
              }
            }
          },
          {
            "id": "projection_3890adb87cdd",
            "from": "invariant_feature_encoder",
            "to": "equivariant_structure_decoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.single_features_enter_ipa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_features_enter_ipa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
              "label": "single state",
              "connection": {
                "title": "Single state to structure decoder",
                "role": "mutable residue state",
                "inside": "The invariant per-residue state supplies IPA queries and the features used to regress each rigid update."
              }
            }
          },
          {
            "id": "projection_920cff6f5a3a",
            "from": "noise_readout",
            "to": "predicted_noise",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.noise_readout_produces_predicted_noise"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.noise_readout_produces_predicted_noise"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.coordinate_noise"
            ],
            "presentation": {
              "label": "coordinate difference",
              "connection": {
                "title": "Denoiser output",
                "role": "predicted diffusion noise",
                "inside": "The resulting B by N by 3 field is consumed by the fixed reverse-diffusion equation on the parent board."
              }
            }
          },
          {
            "id": "projection_4dffa3c9a6d9",
            "from": "timestep",
            "to": "invariant_feature_encoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.timestep_conditions_single_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.timestep_conditions_single_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.timestep"
            ],
            "presentation": {
              "label": "time encoding",
              "tone": "conditioning",
              "connection": {
                "title": "Diffusion time",
                "role": "noise-level conditioning",
                "inside": "A sinusoidal timestep code is repeated over residues and concatenated into the single-feature input."
              }
            }
          },
          {
            "id": "projection_0e9190d9aab1",
            "from": "updated_frames",
            "to": "noise_readout",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.updated_frames_enter_noise_readout"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.updated_frames_enter_noise_readout"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
              "label": "estimated clean direction",
              "connection": {
                "title": "Updated side of displacement",
                "role": "noise readout subtrahend",
                "inside": "Updated frame translations are subtracted from the original noisy translations."
              }
            }
          }
        ],
        "classifications": {
          "modules.backbone_update": "collapsed:modules.equivariant_structure_decoder",
          "modules.equivariant_structure_decoder": "visible",
          "modules.frenet_frame_builder": "excluded",
          "modules.invariant_feature_encoder": "visible",
          "modules.invariant_point_attention": "collapsed:modules.equivariant_structure_decoder",
          "modules.noise_readout": "visible",
          "modules.pair_feature_net": "collapsed:modules.invariant_feature_encoder",
          "modules.pair_transition": "collapsed:modules.invariant_feature_encoder",
          "modules.single_feature_net": "collapsed:modules.invariant_feature_encoder",
          "modules.structure_transition": "collapsed:modules.equivariant_structure_decoder",
          "modules.triangle_multiplication_incoming": "collapsed:modules.invariant_feature_encoder",
          "modules.triangle_multiplication_outgoing": "collapsed:modules.invariant_feature_encoder",
          "value_sites.current_frames": "visible",
          "value_sites.feature_bundle": "visible",
          "value_sites.initial_pair_features": "collapsed:modules.invariant_feature_encoder",
          "value_sites.pair_after_incoming": "collapsed:modules.invariant_feature_encoder",
          "value_sites.pair_after_outgoing": "collapsed:modules.invariant_feature_encoder",
          "value_sites.predicted_noise": "visible",
          "value_sites.refined_pair_features": "collapsed:modules.invariant_feature_encoder",
          "value_sites.single_after_ipa": "collapsed:modules.equivariant_structure_decoder",
          "value_sites.single_after_transition": "collapsed:modules.equivariant_structure_decoder",
          "value_sites.single_features": "collapsed:modules.invariant_feature_encoder",
          "value_sites.timestep": "visible",
          "value_sites.updated_frames": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "invariant_feature_encoder",
        "title": "SE(3)-Invariant Feature Encoder",
        "summary": "The encoder first forms a residue state, expands it into a pair state enriched with current and motif geometry, then applies five active Evoformer-style pair-refinement layers.",
        "parent": "denoiser_forward",
        "subject_ref": "modules.invariant_feature_encoder",
        "expansion_depth": 1,
        "grid": {
          "columns": 7,
          "rows": 6,
          "column_sizing": "content",
          "col_gap": 46
        },
        "nodes": [
          {
            "id": "feature_bundle",
            "ref": "value_sites.feature_bundle",
            "label": "residue + motif features",
            "notation": "F",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 1,
            "row": 1
          },
          {
            "id": "timestep",
            "ref": "value_sites.timestep",
            "label": "timestep",
            "notation": "t",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "scalar",
            "col": 1,
            "row": 3
          },
          {
            "id": "current_frames",
            "ref": "value_sites.current_frames",
            "label": "derived frames from x_t",
            "notation": "T_t",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 5
          },
          {
            "id": "single_feature_net",
            "ref": "modules.single_feature_net",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 2
          },
          {
            "id": "single_features",
            "ref": "value_sites.single_features",
            "label": "single features",
            "notation": "s",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 2
          },
          {
            "id": "pair_feature_net",
            "ref": "modules.pair_feature_net",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 4
          },
          {
            "id": "initial_pair_features",
            "ref": "value_sites.initial_pair_features",
            "label": "initial pair features",
            "notation": "p",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 5,
            "row": 4
          },
          {
            "id": "pair_transform_stack",
            "ref": "modules.pair_transform_stack",
            "prominence": "primary",
            "treatment": "block",
            "col": 6,
            "row": 4,
            "board_ref": "pair_transform_stack"
          },
          {
            "id": "refined_pair_features",
            "ref": "value_sites.refined_pair_features",
            "label": "refined pair features",
            "notation": "p_refined",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 7,
            "row": 4
          }
        ],
        "exclude": [
          {
            "ref": "modules.frenet_frame_builder",
            "reason": "Frenet frames enter this child board as an already-derived denoiser input from the sampling board."
          },
          {
            "ref": "modules.invariant_point_attention",
            "reason": "The invariant encoder board stops at the single and refined-pair outputs; IPA is expanded on the sibling structure-decoder board."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.feature_bundle_conditions_single_feature_net"
            },
            "label": "residue/chain + motif AA",
            "tone": "conditioning",
            "connection": {
              "title": "Single-feature ingredients",
              "role": "per-residue conditioning",
              "inside": "Residue index, chain index, masked motif identities, and masks are concatenated with the repeated timestep code."
            }
          },
          {
            "match": {
              "relation_ref": "relations.timestep_conditions_single_feature_net"
            },
            "label": "sinusoidal t",
            "tone": "conditioning",
            "connection": {
              "title": "Timestep embedding",
              "role": "per-residue noise level",
              "inside": "One diffusion index is sinusoidally encoded and repeated across all residues."
            }
          },
          {
            "match": {
              "relation_ref": "relations.single_feature_net_produces_single_features"
            },
            "label": "B × N × 384",
            "connection": {
              "title": "Single representation",
              "role": "invariant residue state",
              "inside": "A single linear projection produces the 384-channel state used by both pair construction and the structure decoder."
            }
          },
          {
            "match": {
              "relation_ref": "relations.single_features_feed_pair_feature_net"
            },
            "label": "outer sum s_i + s_j",
            "connection": {
              "title": "Residue-to-pair expansion",
              "role": "initialize pair channels",
              "inside": "Separate linear projections of residue i and residue j are added across every ordered residue pair."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_frames_enter_pair_feature_net"
            },
            "label": "noisy d_ij + q_ij",
            "connection": {
              "title": "Current geometry",
              "role": "invariant frame template",
              "inside": "Binned C-alpha distances and relative orientation quaternions encode the noisy structure without a global-coordinate dependence."
            }
          },
          {
            "match": {
              "relation_ref": "relations.feature_bundle_conditions_pair_feature_net"
            },
            "label": "relpos + motif d_ij",
            "tone": "conditioning",
            "connection": {
              "title": "Layout and motif geometry",
              "role": "pair conditioning",
              "inside": "Relative sequence offsets and same-chain flags are always present; motif distances are included only where fixed_structure_mask is true."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_feature_net_produces_initial_pair_features"
            },
            "label": "B × N × N × 128",
            "connection": {
              "title": "Initial pair state",
              "role": "pair-refinement input",
              "inside": "Projected outer-sum, layout, current-frame, and motif-template terms are summed and masked."
            }
          },
          {
            "match": {
              "relation_ref": "relations.initial_pair_features_enter_outgoing_update"
            },
            "label": "×5 layers",
            "connection": {
              "title": "Pair refinement",
              "role": "active base-checkpoint stack",
              "inside": "Each layer applies outgoing multiplication, incoming multiplication, and a pair transition; triangular attention is disabled in the released base configuration."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_transition_produces_refined_pair_features"
            },
            "label": "refined p",
            "connection": {
              "title": "Refined pair state",
              "role": "structure-decoder context",
              "inside": "The final pair state is held fixed while eight equivariant structure layers update residue frames."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_858f2065e17b",
            "from": "current_frames",
            "to": "pair_feature_net",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.current_frames_enter_pair_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_frames_enter_pair_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
              "label": "noisy d_ij + q_ij",
              "connection": {
                "title": "Current geometry",
                "role": "invariant frame template",
                "inside": "Binned C-alpha distances and relative orientation quaternions encode the noisy structure without a global-coordinate dependence."
              }
            }
          },
          {
            "id": "projection_dff392d3ff3f",
            "from": "feature_bundle",
            "to": "pair_feature_net",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_conditions_pair_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_conditions_pair_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "relpos + motif d_ij",
              "tone": "conditioning",
              "connection": {
                "title": "Layout and motif geometry",
                "role": "pair conditioning",
                "inside": "Relative sequence offsets and same-chain flags are always present; motif distances are included only where fixed_structure_mask is true."
              }
            }
          },
          {
            "id": "projection_ab2bef7d07cf",
            "from": "feature_bundle",
            "to": "single_feature_net",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_conditions_single_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_conditions_single_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
              "label": "residue/chain + motif AA",
              "tone": "conditioning",
              "connection": {
                "title": "Single-feature ingredients",
                "role": "per-residue conditioning",
                "inside": "Residue index, chain index, masked motif identities, and masks are concatenated with the repeated timestep code."
              }
            }
          },
          {
            "id": "projection_cbb60e8f1043",
            "from": "initial_pair_features",
            "to": "pair_transform_stack",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.initial_pair_features_enter_outgoing_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.initial_pair_features_enter_outgoing_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "×5 layers",
              "connection": {
                "title": "Pair refinement",
                "role": "active base-checkpoint stack",
                "inside": "Each layer applies outgoing multiplication, incoming multiplication, and a pair transition; triangular attention is disabled in the released base configuration."
              }
            }
          },
          {
            "id": "projection_aa982bed16de",
            "from": "pair_feature_net",
            "to": "initial_pair_features",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.pair_feature_net_produces_initial_pair_features"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_feature_net_produces_initial_pair_features"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "B × N × N × 128",
              "connection": {
                "title": "Initial pair state",
                "role": "pair-refinement input",
                "inside": "Projected outer-sum, layout, current-frame, and motif-template terms are summed and masked."
              }
            }
          },
          {
            "id": "projection_dc45f38423b2",
            "from": "pair_transform_stack",
            "to": "refined_pair_features",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.pair_transition_produces_refined_pair_features"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_transition_produces_refined_pair_features"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "refined p",
              "connection": {
                "title": "Refined pair state",
                "role": "structure-decoder context",
                "inside": "The final pair state is held fixed while eight equivariant structure layers update residue frames."
              }
            }
          },
          {
            "id": "projection_0fa3a065066c",
            "from": "single_feature_net",
            "to": "single_features",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.single_feature_net_produces_single_features"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_feature_net_produces_single_features"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
              "label": "B × N × 384",
              "connection": {
                "title": "Single representation",
                "role": "invariant residue state",
                "inside": "A single linear projection produces the 384-channel state used by both pair construction and the structure decoder."
              }
            }
          },
          {
            "id": "projection_ddea5baf5f8d",
            "from": "single_features",
            "to": "pair_feature_net",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.single_features_feed_pair_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_features_feed_pair_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
              "label": "outer sum s_i + s_j",
              "connection": {
                "title": "Residue-to-pair expansion",
                "role": "initialize pair channels",
                "inside": "Separate linear projections of residue i and residue j are added across every ordered residue pair."
              }
            }
          },
          {
            "id": "projection_8f22f5cab186",
            "from": "timestep",
            "to": "single_feature_net",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.timestep_conditions_single_feature_net"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.timestep_conditions_single_feature_net"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.timestep"
            ],
            "presentation": {
              "label": "sinusoidal t",
              "tone": "conditioning",
              "connection": {
                "title": "Timestep embedding",
                "role": "per-residue noise level",
                "inside": "One diffusion index is sinusoidally encoded and repeated across all residues."
              }
            }
          }
        ],
        "classifications": {
          "modules.frenet_frame_builder": "excluded",
          "modules.invariant_point_attention": "excluded",
          "modules.pair_feature_net": "visible",
          "modules.pair_transform_stack": "visible",
          "modules.pair_transition": "collapsed:modules.pair_transform_stack",
          "modules.single_feature_net": "visible",
          "modules.triangle_multiplication_incoming": "collapsed:modules.pair_transform_stack",
          "modules.triangle_multiplication_outgoing": "collapsed:modules.pair_transform_stack",
          "value_sites.current_frames": "visible",
          "value_sites.feature_bundle": "visible",
          "value_sites.initial_pair_features": "visible",
          "value_sites.pair_after_incoming": "collapsed:modules.pair_transform_stack",
          "value_sites.pair_after_outgoing": "collapsed:modules.pair_transform_stack",
          "value_sites.refined_pair_features": "visible",
          "value_sites.single_features": "visible",
          "value_sites.timestep": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "pair_transform_stack",
        "title": "One Pair Transform Layer (Repeated ×5)",
        "summary": "Each active base-model layer applies outgoing and incoming triangular multiplicative residual updates, then a pair-wise transition MLP. Triangular attention exists in code but is disabled by configuration.",
        "parent": "invariant_feature_encoder",
        "subject_ref": "modules.pair_transform_stack",
        "expansion_depth": 1,
        "grid": {
          "columns": 7,
          "rows": 4,
          "column_sizing": "content",
          "col_gap": 44
        },
        "nodes": [
          {
            "id": "initial_pair_features",
            "ref": "value_sites.initial_pair_features",
            "label": "pair state in",
            "notation": "p",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 1,
            "row": 2
          },
          {
            "id": "triangle_multiplication_outgoing",
            "ref": "modules.triangle_multiplication_outgoing",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 2
          },
          {
            "id": "pair_after_outgoing",
            "ref": "value_sites.pair_after_outgoing",
            "label": "after outgoing update",
            "notation": "p + Delta_out",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 3,
            "row": 2
          },
          {
            "id": "triangle_multiplication_incoming",
            "ref": "modules.triangle_multiplication_incoming",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 2
          },
          {
            "id": "pair_after_incoming",
            "ref": "value_sites.pair_after_incoming",
            "label": "after incoming update",
            "notation": "p + Delta_in",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 5,
            "row": 2
          },
          {
            "id": "pair_transition",
            "ref": "modules.pair_transition",
            "prominence": "primary",
            "treatment": "block",
            "col": 6,
            "row": 2
          },
          {
            "id": "refined_pair_features",
            "ref": "value_sites.refined_pair_features",
            "label": "pair state out",
            "notation": "p'",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 7,
            "row": 2
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.initial_pair_features_enter_outgoing_update"
            },
            "label": "p",
            "connection": {
              "title": "Pair layer input",
              "role": "edge state",
              "inside": "The layer begins from the current N by N pair representation and pair mask."
            }
          },
          {
            "match": {
              "relation_ref": "relations.outgoing_update_produces_pair_state"
            },
            "label": "residual + row dropout",
            "connection": {
              "title": "Outgoing triangle update",
              "role": "two-edge path aggregation",
              "inside": "Information from outgoing triangular paths is added residually after row-wise dropout."
            }
          },
          {
            "match": {
              "relation_ref": "relations.incoming_update_produces_pair_state"
            },
            "label": "residual + row dropout",
            "connection": {
              "title": "Incoming triangle update",
              "role": "complementary path aggregation",
              "inside": "Incoming triangular paths provide the second multiplicative pair update."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_transition_produces_refined_pair_features"
            },
            "label": "residual MLP",
            "connection": {
              "title": "Pair transition output",
              "role": "channel mixing",
              "inside": "A pair-wise transition MLP is added residually and the pair mask is reapplied before the next of five layers."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_6956c306a672",
            "from": "initial_pair_features",
            "to": "triangle_multiplication_outgoing",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.initial_pair_features_enter_outgoing_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.initial_pair_features_enter_outgoing_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "p",
              "connection": {
                "title": "Pair layer input",
                "role": "edge state",
                "inside": "The layer begins from the current N by N pair representation and pair mask."
              }
            }
          },
          {
            "id": "projection_6ad7dd1ed2cf",
            "from": "pair_after_incoming",
            "to": "pair_transition",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.pair_state_enters_pair_transition"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_state_enters_pair_transition"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_00990df669d2",
            "from": "pair_after_outgoing",
            "to": "triangle_multiplication_incoming",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.pair_state_enters_incoming_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_state_enters_incoming_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_a703fd7c3c92",
            "from": "pair_transition",
            "to": "refined_pair_features",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.pair_transition_produces_refined_pair_features"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_transition_produces_refined_pair_features"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "residual MLP",
              "connection": {
                "title": "Pair transition output",
                "role": "channel mixing",
                "inside": "A pair-wise transition MLP is added residually and the pair mask is reapplied before the next of five layers."
              }
            }
          },
          {
            "id": "projection_98d94cc85bea",
            "from": "triangle_multiplication_incoming",
            "to": "pair_after_incoming",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.incoming_update_produces_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.incoming_update_produces_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "residual + row dropout",
              "connection": {
                "title": "Incoming triangle update",
                "role": "complementary path aggregation",
                "inside": "Incoming triangular paths provide the second multiplicative pair update."
              }
            }
          },
          {
            "id": "projection_5171cd52f0a4",
            "from": "triangle_multiplication_outgoing",
            "to": "pair_after_outgoing",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.outgoing_update_produces_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.outgoing_update_produces_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "residual + row dropout",
              "connection": {
                "title": "Outgoing triangle update",
                "role": "two-edge path aggregation",
                "inside": "Information from outgoing triangular paths is added residually after row-wise dropout."
              }
            }
          }
        ],
        "classifications": {
          "modules.pair_transition": "visible",
          "modules.triangle_multiplication_incoming": "visible",
          "modules.triangle_multiplication_outgoing": "visible",
          "value_sites.initial_pair_features": "visible",
          "value_sites.pair_after_incoming": "visible",
          "value_sites.pair_after_outgoing": "visible",
          "value_sites.refined_pair_features": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "structure_decoder",
        "title": "One Equivariant Structure Layer (Repeated ×8)",
        "summary": "IPA combines single, pair, and current-frame information; a residue-wise transition updates the latent state; a learned six-parameter rigid increment is composed into every residue frame.",
        "parent": "denoiser_forward",
        "subject_ref": "modules.equivariant_structure_decoder",
        "expansion_depth": 1,
        "grid": {
          "columns": 7,
          "rows": 6,
          "column_sizing": "content",
          "col_gap": 46
        },
        "nodes": [
          {
            "id": "single_features",
            "ref": "value_sites.single_features",
            "label": "single features",
            "notation": "s",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 2
          },
          {
            "id": "refined_pair_features",
            "ref": "value_sites.refined_pair_features",
            "label": "refined pair features",
            "notation": "p",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "glyph": "pair",
            "col": 1,
            "row": 1
          },
          {
            "id": "current_frames",
            "ref": "value_sites.current_frames",
            "label": "derived frames from x_t",
            "notation": "T",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 4
          },
          {
            "id": "feature_bundle",
            "ref": "value_sites.feature_bundle",
            "label": "residue mask",
            "notation": "m",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "glyph": "vector",
            "col": 2,
            "row": 1
          },
          {
            "id": "invariant_point_attention",
            "ref": "modules.invariant_point_attention",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 3
          },
          {
            "id": "single_after_ipa",
            "ref": "value_sites.single_after_ipa",
            "label": "attention-updated single state",
            "notation": "s_ipa",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 3
          },
          {
            "id": "structure_transition",
            "ref": "modules.structure_transition",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 3
          },
          {
            "id": "single_after_transition",
            "ref": "value_sites.single_after_transition",
            "label": "transitioned single state",
            "notation": "s'",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 3
          },
          {
            "id": "backbone_update",
            "ref": "modules.backbone_update",
            "prominence": "primary",
            "treatment": "block",
            "col": 6,
            "row": 5
          },
          {
            "id": "updated_frames",
            "ref": "value_sites.updated_frames",
            "label": "updated residue frames",
            "notation": "T ∘ Delta T",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 5
          }
        ],
        "exclude": [
          {
            "ref": "modules.frenet_frame_builder",
            "reason": "Frenet frames enter this child board as an already-derived denoiser input from the sampling board."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.single_features_enter_ipa"
            },
            "label": "residue state",
            "connection": {
              "title": "Single state into IPA",
              "role": "attention queries and values",
              "inside": "The per-residue latent state is updated while retaining one position per backbone residue."
            }
          },
          {
            "match": {
              "relation_ref": "relations.refined_pair_features_bias_ipa"
            },
            "label": "pair context",
            "tone": "conditioning",
            "connection": {
              "title": "Pair-conditioned IPA",
              "role": "residue-pair context",
              "inside": "The refined pair tensor biases communication between residue positions and is not changed by the structure stack."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_frames_condition_ipa"
            },
            "label": "frame points",
            "tone": "conditioning",
            "connection": {
              "title": "Equivariant geometric context",
              "role": "spatial attention",
              "inside": "Query, key, and value points are transformed through current residue frames so attention responds equivariantly to global rigid motions."
            }
          },
          {
            "match": {
              "relation_ref": "relations.ipa_produces_updated_single_state"
            },
            "label": "residual + norm",
            "connection": {
              "title": "IPA-updated state",
              "role": "geometric attention output",
              "inside": "IPA is added to the incoming single state, followed by dropout and layer normalization."
            }
          },
          {
            "match": {
              "relation_ref": "relations.structure_transition_produces_single_state"
            },
            "label": "residue-wise MLP",
            "connection": {
              "title": "Structure transition",
              "role": "latent channel update",
              "inside": "A transition network mixes channels independently at each residue before frame regression."
            }
          },
          {
            "match": {
              "relation_ref": "relations.single_state_enters_backbone_update"
            },
            "label": "regress 6 parameters",
            "connection": {
              "title": "Rigid increment regression",
              "role": "frame-update parameters",
              "inside": "Each residue state is linearly projected to rotation and translation update parameters."
            }
          },
          {
            "match": {
              "relation_ref": "relations.current_frames_enter_backbone_update"
            },
            "label": "compose with T",
            "tone": "skip",
            "route_side": "bottom",
            "route_clearance": 42,
            "connection": {
              "title": "Frame composition",
              "role": "equivariant state update",
              "inside": "The learned local rigid increment is composed into the current frame rather than replacing it in a global coordinate system."
            }
          },
          {
            "match": {
              "relation_ref": "relations.backbone_update_produces_updated_frames"
            },
            "label": "next layer / denoiser output",
            "connection": {
              "title": "Updated frames",
              "role": "repeated structure state",
              "inside": "The updated frames feed the next structure layer; after eight layers they return to the denoiser noise readout."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_2b483a9c8db4",
            "from": "backbone_update",
            "to": "updated_frames",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.backbone_update_produces_updated_frames"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.backbone_update_produces_updated_frames"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
              "label": "next layer / denoiser output",
              "connection": {
                "title": "Updated frames",
                "role": "repeated structure state",
                "inside": "The updated frames feed the next structure layer; after eight layers they return to the denoiser noise readout."
              }
            }
          },
          {
            "id": "projection_5659bcb68cf2",
            "from": "current_frames",
            "to": "backbone_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.current_frames_enter_backbone_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_frames_enter_backbone_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
              "label": "compose with T",
              "tone": "skip",
              "route_side": "bottom",
              "route_clearance": 42,
              "connection": {
                "title": "Frame composition",
                "role": "equivariant state update",
                "inside": "The learned local rigid increment is composed into the current frame rather than replacing it in a global coordinate system."
              }
            }
          },
          {
            "id": "projection_7f4cc55c0622",
            "from": "current_frames",
            "to": "invariant_point_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.current_frames_condition_ipa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.current_frames_condition_ipa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.residue_frames"
            ],
            "presentation": {
              "label": "frame points",
              "tone": "conditioning",
              "connection": {
                "title": "Equivariant geometric context",
                "role": "spatial attention",
                "inside": "Query, key, and value points are transformed through current residue frames so attention responds equivariantly to global rigid motions."
              }
            }
          },
          {
            "id": "projection_adee27c9f987",
            "from": "feature_bundle",
            "to": "invariant_point_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.feature_bundle_masks_ipa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.feature_bundle_masks_ipa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.feature_bundle"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_a5d4bbb29495",
            "from": "invariant_point_attention",
            "to": "single_after_ipa",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.ipa_produces_updated_single_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.ipa_produces_updated_single_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
              "label": "residual + norm",
              "connection": {
                "title": "IPA-updated state",
                "role": "geometric attention output",
                "inside": "IPA is added to the incoming single state, followed by dropout and layer normalization."
              }
            }
          },
          {
            "id": "projection_ba12da4da645",
            "from": "refined_pair_features",
            "to": "invariant_point_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.refined_pair_features_bias_ipa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.refined_pair_features_bias_ipa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_features"
            ],
            "presentation": {
              "label": "pair context",
              "tone": "conditioning",
              "connection": {
                "title": "Pair-conditioned IPA",
                "role": "residue-pair context",
                "inside": "The refined pair tensor biases communication between residue positions and is not changed by the structure stack."
              }
            }
          },
          {
            "id": "projection_f5fcbebc460e",
            "from": "single_after_ipa",
            "to": "structure_transition",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.ipa_state_enters_structure_transition"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.ipa_state_enters_structure_transition"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_4b3c7ed524f2",
            "from": "single_after_transition",
            "to": "backbone_update",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.single_state_enters_backbone_update"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_state_enters_backbone_update"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
              "label": "regress 6 parameters",
              "connection": {
                "title": "Rigid increment regression",
                "role": "frame-update parameters",
                "inside": "Each residue state is linearly projected to rotation and translation update parameters."
              }
            }
          },
          {
            "id": "projection_9ebca3846d78",
            "from": "single_features",
            "to": "invariant_point_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.single_features_enter_ipa"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_features_enter_ipa"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
              "label": "residue state",
              "connection": {
                "title": "Single state into IPA",
                "role": "attention queries and values",
                "inside": "The per-residue latent state is updated while retaining one position per backbone residue."
              }
            }
          },
          {
            "id": "projection_63b2834adefb",
            "from": "structure_transition",
            "to": "single_after_transition",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.structure_transition_produces_single_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.structure_transition_produces_single_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_features"
            ],
            "presentation": {
              "label": "residue-wise MLP",
              "connection": {
                "title": "Structure transition",
                "role": "latent channel update",
                "inside": "A transition network mixes channels independently at each residue before frame regression."
              }
            }
          }
        ],
        "classifications": {
          "modules.backbone_update": "visible",
          "modules.frenet_frame_builder": "excluded",
          "modules.invariant_point_attention": "visible",
          "modules.structure_transition": "visible",
          "value_sites.current_frames": "visible",
          "value_sites.feature_bundle": "visible",
          "value_sites.refined_pair_features": "visible",
          "value_sites.single_after_ipa": "visible",
          "value_sites.single_after_transition": "visible",
          "value_sites.single_features": "visible",
          "value_sites.updated_frames": "visible"
        },
        "projectionMode": "derived"
      }
    ]
  }
};
